import React, { useState, useEffect } from 'react';

interface Activity {
  classroom: number;
  autonomous: number;
  days?: number;
}

interface ActivityData {
  name: string;
  classroomHours?: number;
  autonomousHours?: number;
  totalHours?: number;
  creditPerUnit?: number;
  isDays?: boolean;
  creditPerDay?: number;
}

const CreditTracker: React.FC = () => {
  const [activities, setActivities] = useState<Record<string, Activity>>({
    courses: { classroom: 0, autonomous: 0 },
    seminars: { classroom: 0, autonomous: 0 },
    labs: { classroom: 0, autonomous: 0 },
    transversal: { classroom: 0, autonomous: 0 },
    teaching: { classroom: 0, autonomous: 0 },
    tutoring: { classroom: 0, autonomous: 0 },
    extraCurricular: { classroom: 0, autonomous: 0, days: 0 },
    dissemination: { classroom: 0, autonomous: 0, days: 0 },
  });

  const activityDefinitions: Record<string, ActivityData> = {
    courses: {
      name: "Courses (PhD, Unibo, external)",
      classroomHours: 5,
      autonomousHours: 20,
      totalHours: 25,
      creditPerUnit: 1
    },
    seminars: {
      name: "Seminars",
      classroomHours: 10,
      autonomousHours: 15,
      totalHours: 25,
      creditPerUnit: 1
    },
    labs: {
      name: "Labs",
      classroomHours: 15,
      autonomousHours: 10,
      totalHours: 25,
      creditPerUnit: 1
    },
    transversal: {
      name: "Transversal Skills",
      classroomHours: 15,
      autonomousHours: 10,
      totalHours: 25,
      creditPerUnit: 1
    },
    teaching: {
      name: "Teaching",
      classroomHours: 5,
      autonomousHours: 20,
      totalHours: 25,
      creditPerUnit: 1
    },
    tutoring: {
      name: "Tutoring",
      classroomHours: 20,
      autonomousHours: 5,
      totalHours: 25,
      creditPerUnit: 1
    },
    extraCurricular: {
      name: "Extra-curricular Activities",
      isDays: true,
      creditPerDay: 0.5
    },
    dissemination: {
      name: "Dissemination",
      isDays: true,
      creditPerDay: 0.5
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('doctoralActivities');
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('doctoralActivities', JSON.stringify(activities));
  }, [activities]);

  const calculateCredits = (type: string, activity: Activity): number => {
    const def = activityDefinitions[type];
    if (def.isDays) {
      return (activity.days || 0) * (def.creditPerDay || 0);
    } else {
      const completedUnits = Math.floor(
        Math.min(
          activity.classroom / (def.classroomHours || 1), 
          activity.autonomous / (def.autonomousHours || 1)
        )
      );
      return completedUnits * (def.creditPerUnit || 0);
    }
  };

  const handleInputChange = (type: string, field: string, value: string) => {
    setActivities(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const totalTrainingCredits = Object.entries(activities).reduce(
    (sum, [type, activity]) => sum + calculateCredits(type, activity),
    0
  );

  const totalCredits = totalTrainingCredits + 140; // 140 fixed research credits

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Doctoral Credits Tracker</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Training Credits: {totalTrainingCredits.toFixed(1)}/40</span>
            <span>{Math.min((totalTrainingCredits/40)*100, 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{width: `${Math.min((totalTrainingCredits/40)*100, 100)}%`}}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Total Credits: {totalCredits.toFixed(1)}/180</span>
            <span>{Math.min((totalCredits/180)*100, 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all" 
              style={{width: `${Math.min((totalCredits/180)*100, 100)}%`}}
            />
          </div>
        </div>
      </div>

      {Object.entries(activityDefinitions).map(([type, def]) => (
        <div key={type} className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="font-semibold mb-2">{def.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {def.isDays ? (
              <div>
                <label className="block text-sm mb-1">Days attended:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={activities[type].days || 0}
                  onChange={(e) => handleInputChange(type, 'days', e.target.value)}
                  className="border rounded px-2 py-1 w-24"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm mb-1">
                    Classroom hours (required: {def.classroomHours}h/unit):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={activities[type].classroom}
                    onChange={(e) => handleInputChange(type, 'classroom', e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Autonomous study (required: {def.autonomousHours}h/unit):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={activities[type].autonomous}
                    onChange={(e) => handleInputChange(type, 'autonomous', e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm mb-1">Credits earned:</label>
              <strong>{calculateCredits(type, activities[type]).toFixed(1)} CD</strong>
            </div>
          </div>
        </div>
      ))}

      {totalTrainingCredits > 40 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
          Warning: Training credits exceed maximum of 40 CD
        </div>
      )}
    </div>
  );
};

export default CreditTracker;