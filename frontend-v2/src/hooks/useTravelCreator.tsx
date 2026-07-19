import type { AxiosErrorResponse } from "@/types/commons";
import type { User } from "@/types/user";
import type { TravelFormData } from "@/types/travel";
import type { TranslationFn } from "@/types/i18n";

import { useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useUser } from "@/contexts/UserContext";
import TravelService from "@/services/TravelService";
import UserService from "@/services/UserService";
import VisitService from "@/services/VisitService";
import { getTimeFromCurrent } from "@/utils";

const validateFields = (formData: TravelFormData, t: TranslationFn): boolean => {
  if (!formData.origin || !formData.destination) {
    throw new Error(t("messages.validationOriginDestinationRequired"));
  }

  if (formData.origin === formData.destination) {
    throw new Error(t("messages.validationOriginDestinationDifferent"));
  }

  return true;
}

const performCreationForAllUsers = async (formData: TravelFormData, queryClient: QueryClient, t: TranslationFn) => {
  const users = await UserService.getAll();

  if (users.length === 0) {
    toast.error(t("messages.noUsersFound"));
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      await TravelService.create(formData, user.userId);
      await VisitService.persistIfNeeded(formData.startTime.split('T')[0], user.userId);
      successCount++;
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;

      toast.error(axiosError.response?.data?.message, { style: { background: 'red' } });
      errorCount++;
    }
  }

  if (errorCount === 0) {
    toast.success(t("messages.travelCreatedAllUsersSuccess", { count: successCount }));
    void queryClient.invalidateQueries({ queryKey: ['travel_stats'] });
  } else {
    toast.warning(t("messages.travelCreatedAllUsersError", { count: errorCount }), { style: { background: 'red' } });
  }
}

const performCreationForCurrentUser = async (formData: TravelFormData, currentUser: User | null, queryClient: QueryClient, t: TranslationFn) => {
  const userId = currentUser?.userId;
  await TravelService.create(formData, userId);
  const persisted = await VisitService.persistIfNeeded(formData.startTime.split('T')[0], userId);
  void queryClient.invalidateQueries({ queryKey: ['travel_stats'] });

  if (persisted) {
    toast.success(t("messages.travelWithVisitSuccess"));
  } else {
    toast.success(t("messages.travelSuccess"));
  }
}

const getSameDayEndTime = (startTime: string, endTime: string) => {
  const datePart = startTime.split('T')[0]
  const endTimeHourPart = endTime.split('T')[1]

  return datePart.concat('T').concat(endTimeHourPart)
}

const useTravelCreator = () => {
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  const [createForAllUsers, setCreateForAllUsers] = useState<boolean>(false);
  const [isSameDay, setIsSameDay] = useState<boolean>(true);

  const [formData, setFormData] = useState<TravelFormData>({
    origin: "",
    destination: "",
    startTime: getTimeFromCurrent(2),
    endTime: getTimeFromCurrent(0),
    modeOfTransport: "car",
    line: "",
    distance: "",
    price: "",
    crosses: []
  });

  const handleChangeOnSameDay = (name: keyof TravelFormData, value: string) => {
    if (name === 'startTime') {
      // startTime can be edited, so endTime needs to be updated too
      const endTime = getSameDayEndTime(value, formData.endTime)

      setFormData({
        ...formData,
        startTime: value,
        endTime
      })

      return true
    }

    if (name === 'endTime') {
      const datePart = formData.startTime.split('T')[0]

      // Keep original format for backend (datetime-local)
      value = datePart.concat('T').concat(value)

      setFormData({
        ...formData,
        endTime: value,
      });

      return true
    }

    return false
  }

  // Auto-complete destination based on past travels sharing this origin + hour:minute
  const suggestDestination = async (origin: string, startTime: string, currentDestination: string) => {
    if (!origin || !startTime || currentDestination) return

    try {
      const suggestion = await queryClient.fetchQuery({
        queryKey: ['suggest_destination', origin, startTime, currentUser?.userId],
        queryFn: () => TravelService.suggestDestination(origin, startTime, currentUser?.userId),
        staleTime: 1000 * 60 * 30,
      });

      if (suggestion) {
        setFormData(prev => (prev.destination ? prev : { ...prev, destination: suggestion.destination }));
      }
    } catch (err) {
      // Si falla, simplemente seguimos sin auto-completar
      console.error("Error fetching destination suggestion:", err);
    }
  }

  const handleChange = async (name: keyof TravelFormData, value: string | string[]) => {
    if (isSameDay && typeof value === 'string') {
      try {
        const updated = handleChangeOnSameDay(name, value)

        if (updated) {
          if (name === 'startTime') {
            void suggestDestination(formData.origin, value, formData.destination)
          }

          return
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (name === 'origin' && typeof value === 'string') {
      void suggestDestination(value, formData.startTime, formData.destination)
    }

    if (name === 'startTime' && typeof value === 'string' && !isSameDay) {
      void suggestDestination(formData.origin, value, formData.destination)
    }

    // Auto-complete distance based on last travel only when changing destination
    if (name === 'destination' && typeof value === 'string') {
      const { origin, distance } = formData
      const destination = value

      if (origin && destination && !distance) {
        try {
          // Usamos fetchQuery para aprovechar el cache si ya se pidió antes
          const lastTravel = await queryClient.fetchQuery({
            queryKey: ['last_travel', origin, destination, currentUser?.userId],
            queryFn: () => TravelService.findLastTravel(origin, destination, currentUser?.userId),
            staleTime: 1000 * 60 * 30,
          });

          if (lastTravel) {
            setFormData(prev => ({
              ...prev,
              destination,
              distance: lastTravel.distance.toString(),
            }));

            return;
          }
        } catch (err) {
          // Si falla, simplemente seguimos sin auto-completar
          console.error("Error fetching last travel for autocomplete:", err);
        }
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const t = useTranslations("Creator");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      validateFields(formData, t)
    } catch (error) {
      const err = error as Error

      toast.error(err.message, { style: { background: 'red' } })
      return;
    }

    try {
      if (createForAllUsers) {
        await performCreationForAllUsers(formData, queryClient, t);
      } else {
        await performCreationForCurrentUser(formData, currentUser, queryClient, t);
      }

      setFormData({
        ...formData,
        origin: formData.destination,
        destination: "",
        startTime: formData.endTime,
        line: "",
        distance: "",
        crosses: [],
      });
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;

      toast.error(axiosError.response?.data?.message, { style: { background: 'red' } });
    }
  }

  const handleSameDayCheck = (newStatus: boolean) => {
    if (isSameDay) {
      const endTime = getSameDayEndTime(formData.startTime, formData.endTime)

      setFormData({
        ...formData,
        endTime
      })
    }

    setIsSameDay(newStatus)
  }

  return {
    createForAllUsers,
    isSameDay,
    formData,
    setCreateForAllUsers,
    setIsSameDay: handleSameDayCheck,
    handleChange,
    handleSubmit,
  }
}

export default useTravelCreator;