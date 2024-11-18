import React, { useState, useEffect } from 'react';

interface ActivityEntry {
  title: string;
  dateFrom: string;
  dateTo?: string;
  classroom: number;
  autonomous: number;
  days?: number;
  type: string;
}

interface Activity {
  classroom: number;
  autonomous: number;
  days?: number;
  entries: ActivityEntry[];
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
    courses: { classroom: 0, autonomous: 0, entries: [] },
    seminars: { classroom: 0, autonomous: 0, entries: [] },
    labs: { classroom: 0, autonomous: 0, entries: [] },
    transversal: { classroom: 0, autonomous: 0, entries: [] },
    teaching: { classroom: 0, autonomous: 0, entries: [] },
    tutoring: { classroom: 0, autonomous: 0, entries: [] },
    extraCurricular: { classroom: 0, autonomous: 0, days: 0, entries: [] },
    dissemination: { classroom: 0, autonomous: 0, days: 0, entries: [] },
  });

  const [currentEntry, setCurrentEntry] = useState<{
    type: string;
    title: string;
    dateFrom: string;
    dateTo: string;
    classroom: number;
    autonomous: number;
    days: number;
  }>({
    type: '',
    title: '',
    dateFrom: '',
    dateTo: '',
    classroom: 0,
    autonomous: 0,
    days: 0,
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
      // Calculate exact units for each type of hours
      const classroomUnits = activity.classroom / (def.classroomHours || 1);
      const autonomousUnits = activity.autonomous / (def.autonomousHours || 1);
      
      // Take the minimum number of completed units (including partial)
      const completedUnits = Math.min(classroomUnits, autonomousUnits);
      
      // Return with 1 decimal precision
      return Math.round((completedUnits * (def.creditPerUnit || 0)) * 10) / 10;
    }
  };

  const handleEntrySubmit = (type: string) => {
    if (!currentEntry.title || !currentEntry.dateFrom) return;
  
    const newEntry: ActivityEntry = {
      title: currentEntry.title,
      dateFrom: currentEntry.dateFrom,
      dateTo: currentEntry.dateTo || undefined,
      classroom: currentEntry.classroom,
      autonomous: currentEntry.autonomous,
      days: currentEntry.days,
      type
    };
  
    setActivities(prev => {
      // Get existing entries for this type
      const existingEntries = prev[type].entries || [];
      
      // Calculate new totals
      const newClassroomTotal = existingEntries.reduce((sum, entry) => sum + (entry.classroom || 0), 0) + (newEntry.classroom || 0);
      const newAutonomousTotal = existingEntries.reduce((sum, entry) => sum + (entry.autonomous || 0), 0) + (newEntry.autonomous || 0);
      const newDaysTotal = existingEntries.reduce((sum, entry) => sum + (entry.days || 0), 0) + (newEntry.days || 0);
  
      return {
        ...prev,
        [type]: {
          classroom: newClassroomTotal,
          autonomous: newAutonomousTotal,
          days: newDaysTotal,
          entries: [...existingEntries, newEntry]  // Append new entry to existing ones
        }
      };
    });
  
    // Reset current entry
    setCurrentEntry({
      type: '',
      title: '',
      dateFrom: '',
      dateTo: '',
      classroom: 0,
      autonomous: 0,
      days: 0,
    });
  };

  const deleteEntry = (type: string, indexToDelete: number) => {
    setActivities(prev => {
      const updatedEntries = prev[type].entries.filter((_, index) => index !== indexToDelete);
      
      // Recalculate totals after deletion
      const newClassroomTotal = updatedEntries.reduce((sum, entry) => sum + (entry.classroom || 0), 0);
      const newAutonomousTotal = updatedEntries.reduce((sum, entry) => sum + (entry.autonomous || 0), 0);
      const newDaysTotal = updatedEntries.reduce((sum, entry) => sum + (entry.days || 0), 0);
  
      return {
        ...prev,
        [type]: {
          classroom: newClassroomTotal,
          autonomous: newAutonomousTotal,
          days: newDaysTotal,
          entries: updatedEntries
        }
      };
    });
  };

  const exportToCSV = () => {
    // CSV Header
    let csvContent = "Type,Title,Date From,Date To,Classroom Hours,Autonomous Hours,Days,Credits\n";
    
    Object.entries(activities).forEach(([type, activity]) => {
      activity.entries.forEach(entry => {
        // Combine type and title with a comma but wrap in quotes
        const typeAndTitle = `${type},${entry.title}`;
        
        // Format each entry as a CSV row
        const row = [
          typeAndTitle,                      // Type,Title as one field
          entry.dateFrom,                    // Date From
          entry.dateTo || '',                // Date To
          Math.round(entry.classroom || 0),  // Classroom Hours (no decimals)
          Math.round(entry.autonomous || 0), // Autonomous Hours (no decimals)
          entry.days || '',                  // Days
          calculateCredits(type, {           // Credits
            classroom: entry.classroom || 0,
            autonomous: entry.autonomous || 0,
            days: entry.days || 0,
            entries: []
          })
        ].join(',');
  
        csvContent += row + '\n';
      });
    });
  
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'doctoral_credits.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalTrainingCredits = Object.entries(activities).reduce(
    (sum, [type, activity]) => sum + calculateCredits(type, activity),
    0
  );

  const totalCredits = totalTrainingCredits + 140;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctoral Credits Tracker</h1>

      <div className="progress-section">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Training Credits: {totalTrainingCredits.toFixed(1)}/40 ({(totalTrainingCredits/40*100).toFixed(1)}%)</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((totalTrainingCredits/40)*100, 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Total Credits: {totalCredits.toFixed(1)}/180 ({(totalCredits/180*100).toFixed(1)}%)</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((totalCredits/180)*100, 100)}%` }}
            />
          </div>
        </div>
      </div>
      {Object.entries(activityDefinitions).map(([type, def]) => (
          <div key={type} className="activity-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{def.name}</h3>
            
            <div className="input-group">
              <label className="input-label">Title:</label>
              <input
                type="text"
                value={currentEntry.type === type ? currentEntry.title : ''}
                onChange={(e) => setCurrentEntry(prev => ({
                  ...prev,
                  type,
                  title: e.target.value
                }))}
                className="input-field"
                placeholder="Activity title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">From:</label>
                <input
                  type="date"
                  value={currentEntry.type === type ? currentEntry.dateFrom : ''}
                  onChange={(e) => setCurrentEntry(prev => ({
                    ...prev,
                    type,
                    dateFrom: e.target.value
                  }))}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label className="input-label">To (optional):</label>
                <input
                  type="date"
                  value={currentEntry.type === type ? currentEntry.dateTo : ''}
                  onChange={(e) => setCurrentEntry(prev => ({
                    ...prev,
                    type,
                    dateTo: e.target.value
                  }))}
                  className="input-field"
                />
              </div>
            </div>

            {def.isDays ? (
              <div className="input-group">
                <label className="input-label">Days attended:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={currentEntry.type === type ? currentEntry.days : 0}
                  onChange={(e) => setCurrentEntry(prev => ({
                    ...prev,
                    type,
                    days: Number(e.target.value)
                  }))}
                  className="input-field"
                />
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label className="input-label">
                    Classroom hours (required: {def.classroomHours}h/unit):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentEntry.type === type ? currentEntry.classroom : 0}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      type,
                      classroom: Number(e.target.value)
                    }))}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">
                    Autonomous study (required: {def.autonomousHours}h/unit):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentEntry.type === type ? currentEntry.autonomous : 0}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      type,
                      autonomous: Number(e.target.value)
                    }))}
                    className="input-field"
                  />
                </div>
              </>
            )}
            
            <button
              onClick={() => handleEntrySubmit(type)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Entry
            </button>

            <div className="credits-display">
              Total Credits: {calculateCredits(type, activities[type]).toFixed(1)} CD
            </div>
          </div>
        ))}

        <button
          onClick={exportToCSV}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Export to CSV
        </button>
      </div>

      {/* Activity cards column */}
{/* Activity cards column */}
<div className="bg-gray-50 p-4 rounded-lg">
  <h2 className="text-xl font-semibold mb-4">Activity Entries</h2>
  {Object.entries(activities).map(([type, activity]) => (
    activity.entries.map((entry, index) => (
      <div key={`${type}-${index}`} className="bg-white rounded-lg shadow p-4 mb-4 relative">
        <button
          onClick={() => deleteEntry(type, index)}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
        >
          ×
        </button>
        <h3 className="font-semibold text-lg">{entry.title}</h3>
        <p className="text-sm text-gray-600">
          Type: {activityDefinitions[type].name}
        </p>
        <p className="text-sm text-gray-600">
          Date: {entry.dateFrom} {entry.dateTo ? `to ${entry.dateTo}` : ''}
        </p>
        {activityDefinitions[type].isDays ? (
          <p className="text-sm text-gray-600">Days: {entry.days}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">Classroom: {entry.classroom}h</p>
            <p className="text-sm text-gray-600">Autonomous: {entry.autonomous}h</p>
          </>
        )}
        <p className="text-sm font-semibold mt-2">
          Credits: {calculateCredits(type, {
            classroom: entry.classroom || 0,
            autonomous: entry.autonomous || 0,
            days: entry.days || 0,
            entries: []
          }).toFixed(1)} CD
        </p>
      </div>
    ))
  ))}
</div>
    </div>
  );
};

export default CreditTracker;