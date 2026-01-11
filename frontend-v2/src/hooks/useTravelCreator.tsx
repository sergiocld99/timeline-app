import type { AxiosErrorResponse } from "@/types/commons";
import type { User } from "@/types/user";

import { useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/contexts/UserContext";
import TravelService from "@/services/TravelService";
import UserService from "@/services/UserService";
import VisitService from "@/services/VisitService";
import { getTimeFromCurrent } from "@/utils";

type TravelFormData = {
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  modeOfTransport: string;
  distance: string;
  price: string;
}

const validateFields = (formData: TravelFormData): boolean => {
  if (formData.startTime === formData.endTime) {
    throw new Error("Start time and end time cannot be the same.");
  }

  if (formData.origin === formData.destination) {
    throw new Error("Origin and destination cannot be the same.");
  }

  const start = new Date(formData.startTime);
  const end = new Date(formData.endTime);
  const durationMs = end.getTime() - start.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (durationMs > oneDayMs) {
    throw new Error("Travel duration cannot exceed 24 hours.");
  }

  if (durationMs < 0) {
    throw new Error("Start time cannot be after end time.");
  }

  return true;
}

const performCreationForAllUsers = async (formData: TravelFormData) => {
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

      if (axiosError.response?.status === 400 && axiosError.response?.data?.message?.includes('24 hours')) {
        toast.error("Travel duration cannot exceed 24 hours. Operation cancelled.");
        return;
      }
      errorCount++;
    }
  }

  if (errorCount === 0) {
    toast.success(`Travel created successfully for all ${successCount} users!`);
  } else {
    toast.warning(`Travel created for ${successCount} users, but ${errorCount} failed.`);
  }
}

const performCreationForCurrentUser = async (formData: TravelFormData, currentUser: User | null) => {
  const userId = currentUser?.userId;
  await TravelService.create(formData, userId);
  const persisted = await VisitService.persistIfNeeded(formData.startTime.split('T')[0], userId);

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
  const [createForAllUsers, setCreateForAllUsers] = useState<boolean>(false);
  const [isSameDay, setIsSameDay] = useState<boolean>(true);

  const [formData, setFormData] = useState<TravelFormData>({
    origin: "",
    destination: "",
    startTime: getTimeFromCurrent(2),
    endTime: getTimeFromCurrent(0),
    modeOfTransport: "car",
    distance: "",
    price: ""
  });

  const handleChange = (name: keyof TravelFormData, value: string) => {
    if (isSameDay) {
      if (name === 'startTime') {
        // startTime can be edited, so endTime needs to be updated too
        try {
          const endTime = getSameDayEndTime(value, formData.endTime)

          setFormData({
            ...formData,
            startTime: value,
            endTime
          })

          return
        } catch (err) {
          console.error(err)
        }
      }

      if (name === 'endTime') {
        const datePart = formData.startTime.split('T')[0]
        
        // Keep original format for backend (datetime-local)
        value = datePart.concat('T').concat(value)
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
        await performCreationForAllUsers(formData);
      } else {
        await performCreationForCurrentUser(formData, currentUser);
      }

      setFormData({
        ...formData,
        origin: formData.destination,
        destination: "",
        startTime: formData.endTime,
        distance: "",
      });
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;

      if (axiosError.response?.status === 400 && axiosError.response?.data?.message?.includes('24 hours')) {
        toast.error("Travel duration cannot exceed 24 hours.");
      } else {
        toast.error("Failed to add travel. Please try again.");
      }
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