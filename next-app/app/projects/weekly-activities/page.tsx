import WeeklyActivities from '@/app/components/WeeklyActivities';

export const dynamic = 'force-dynamic';

export default function WeeklyActivitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            รายละเอียดกิจกรรมรายสัปดาห์
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ติดตามและดูรายละเอียดกิจกรรมของพนักงานในแต่ละสัปดาห์
          </p>
        </div>
        
        <WeeklyActivities />
      </div>
    </div>
  );
}
