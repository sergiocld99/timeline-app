"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { Dispatch, SetStateAction } from "react"
import type { Cross } from "@/types/cross";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import CrossForm from "@/components/CrossForm";
import CrossTable from "@/components/CrossTable";
import TravelTable from "@/components/TravelTable";
import useCrosses from "@/hooks/useCrosses";
import useTravels from "@/hooks/useTravels";
import TravelService from "@/services/TravelService";

const CrossesPageClient = () => {
  const { crosses } = useCrosses();
  const { travels: travelsData, refetch: refetchTravels } = useTravels();
  const [orCrosses, setOrCrosses] = useState<Cross[]>([]);
  const [editCrosses, setEditCrosses] = useState<Cross[]>([]);

  const { travels, stats } = travelsData;

  const updateSet = (checked: CheckedState, item: Cross, setFn: Dispatch<SetStateAction<Cross[]>>) => {
    if (checked === true) {
      setFn(prev => [...prev, item]);
    } else {
      setFn(prev => prev.filter(c => c._id !== item._id));
    }
  };

  useEffect(() => {
    refetchTravels(orCrosses.map(cross => cross._id));
  }, [orCrosses, refetchTravels]);

  const onCheckOR = (checked: CheckedState, item: Cross) => {
    updateSet(checked, item, setOrCrosses);
  };

  const onCheckEdit = (checked: CheckedState, item: Cross) => {
    updateSet(checked, item, setEditCrosses);
  };

  const onAddCrosses = async (travelId: string) => {
    const currentTravelCrosses = travels.find(t => t._id === travelId)?.crosses ?? [];
    const crosses = [...currentTravelCrosses, ...editCrosses];

    if (currentTravelCrosses.length === crosses.length) {
      toast.info('No addition needed for this travel');
      return;
    }

    TravelService.update(travelId, { crosses })
      .then(t => {
        toast.success(`After addition, travel has ${t.crosses.length} crosses, wanted ${crosses.length}`);
      })
      .catch(err => {
        toast.error(`Failed to add crosses: ${err}`);
      });
  };

  const onRemoveCrosses = async (travelId: string) => {
    const crossIdsToRemove = editCrosses.map(c => c._id);
    const currentTravelCrosses = travels.find(t => t._id === travelId)?.crosses ?? [];
    const crosses = currentTravelCrosses.filter(c => !crossIdsToRemove.includes(c._id));

    if (currentTravelCrosses.length === crosses.length) {
      toast.info('No deletion needed for this travel');
      return;
    }

    TravelService.update(travelId, { crosses })
      .then(t => {
        toast.success(`After deletion, travel has ${t.crosses.length} crosses, wanted ${crosses.length}`);
      })
      .catch(err => {
        toast.error(`Failed to remove crosses: ${err}`);
      })
      .finally(() => refetchTravels(orCrosses.map(cross => cross._id)));
  };

  return (
    <main className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen gap-8 px-8 w-full">
      <div className="flex flex-col lg:flex-row gap-8 mx-auto">
        <div className="w-full lg:w-1/3">
          <CrossForm />
        </div>
        <div className="hidden lg:block w-2/3">
          <CrossTable data={crosses} onCheckOR={onCheckOR} onCheckEdit={onCheckEdit} />
        </div>
        <div className="lg:hidden w-full">
          <CrossTable data={crosses} onCheckOR={onCheckOR} isMobile />
        </div>
      </div>
      <div className="py-8 space-y-8">
        <TravelTable
          travels={travels}
          stats={stats}
          onAddCrosses={onAddCrosses}
          onRemoveCrosses={onRemoveCrosses}
        />
      </div>
    </main>
  );
};

export default CrossesPageClient;

