import type { AxiosErrorResponse } from "@/types/commons";
import type { User } from "@/types/user";
import type { TravelFormData } from "@/types/travel";;

import { useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useUser } from "@/contexts/UserContext";
import TravelService from "@/services/TravelService";
import UserService from "@/services/UserService";
import VisitService from "@/services/VisitService";
import { getTimeFromCurrent } from "@/utils";

const validateFields = (formData: TravelFormData): boolean => {
  if (!formData.origin || !formData.destination) {
    throw new Error("Origin and destination are required.");
  }

  if (formData.origin === formData.destination) {
    throw new Error("Origin and destination should be different");
  }

  return true;
}

const performCreationForAllUsers = async (formData: TravelFormData, queryClient: QueryClient) => {
  const users = await UserService.getAll();

  if (users.length === 0) {
    toast.error("No users found.");
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
    toast.success(`Travel created successfully for all ${successCount} users!`);
    void queryClient.invalidateQueries({ queryKey: ['travel_stats'] });
  } else {
    toast.warning(`Travel creation failed for ${errorCount} users.`, { style: { background: 'red' } });
  }
}

const performCreationForCurrentUser = async (formData: TravelFormData, currentUser: User | null, queryClient: QueryClient) => {
  const userId = currentUser?.userId;
  await TravelService.create(formData, userId);
  const persisted = await VisitService.persistIfNeeded(formData.startTime.split('T')[0], userId);
  void queryClient.invalidateQueries({ queryKey: ['travel_stats'] });

  if (persisted) {
    toast.success("Travel with visit added successfully!");
  } else {
    toast.success("Travel added successfully");
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

  const handleChange = async (name: keyof TravelFormData, value: string | string[]) => {
    if (isSameDay && typeof value === 'string') {
      try {
        const updated = handleChangeOnSameDay(name, value)

        if (updated) {
          return
        }
      } catch (err) {
        console.error(err)
      }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      validateFields(formData)
    } catch (error) {
      const err = error as Error

      toast.error(err.message, { style: { background: 'red' } })
      return;
    }

    try {
      if (createForAllUsers) {
        await performCreationForAllUsers(formData, queryClient);
      } else {
        await performCreationForCurrentUser(formData, currentUser, queryClient);
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