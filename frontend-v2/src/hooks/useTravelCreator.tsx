import { useUser } from "@/contexts/UserContext";
import TravelService from "@/services/TravelService";
import UserService from "@/services/UserService";
import VisitService from "@/services/VisitService";
import { AxiosErrorResponse } from "@/types/commons";
import { User } from "@/types/user";
import { getTimeFromCurrent } from "@/utils";
import { useState } from "react";
import { toast } from "sonner";

type FormData = {
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  modeOfTransport: string;
  distance: string;
  price: string;
}

const validateFields = (formData: FormData) => {
  if (formData.startTime === formData.endTime) {
    toast.error("Start time and end time cannot be the same.");
    return;
  }
  if (new Date(formData.startTime) > new Date(formData.endTime)) {
    toast.error("Start time cannot be after end time.");
    return;
  }
  if (formData.origin === formData.destination) {
    toast.error("Origin and destination cannot be the same.");
    return;
  }

  const start = new Date(formData.startTime);
  const end = new Date(formData.endTime);
  const durationMs = end.getTime() - start.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (durationMs > oneDayMs) {
    toast.error("Travel duration cannot exceed 24 hours.");
    return;
  }
}

const performCreationForAllUsers = async (formData: FormData) => {
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

const performCreationForCurrentUser = async (formData: FormData, currentUser: User | null) => {
  const userId = currentUser?.userId;
  await TravelService.create(formData, userId);
  const persisted = await VisitService.persistIfNeeded(formData.startTime.split('T')[0], userId);

  if (persisted) {
    toast.success("Travel with visit added successfully!");
  } else {
    toast.success("Travel added successfully");
  }
}

const useTravelCreator = () => {
  const { currentUser } = useUser();
  const [createForAllUsers, setCreateForAllUsers] = useState<boolean>(false);
  const [isSameDay, setIsSameDay] = useState<boolean>(true);

  const [formData, setFormData] = useState<FormData>({
    origin: "",
    destination: "",
    startTime: getTimeFromCurrent(2),
    endTime: getTimeFromCurrent(0),
    modeOfTransport: "car",
    distance: "",
    price: ""
  });

  const handleChange = (name: keyof FormData, value: string) => {
    if (isSameDay && name === 'startTime') {
      try {
        const datePart = value.split('T')[0]
        const endTimeHourPart = formData.endTime.split('T')[1]
        
        setFormData({
          ...formData,
          startTime: value,
          endTime: datePart.concat('T').concat(endTimeHourPart)
        })

        return
      } catch (err) {
        console.error(err)
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields(formData)

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

  return {
    createForAllUsers,
    isSameDay,
    formData,
    setCreateForAllUsers,
    setIsSameDay,
    handleChange,
    handleSubmit,
  }
}

export default useTravelCreator;