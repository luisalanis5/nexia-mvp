export default function LoadingProfile() {
  return (
    <div className="min-h-screen bg-[#0d0d12] p-4 animate-pulse">
      <div className="max-w-md mx-auto space-y-6 pt-12">
        {/* Avatar Skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-800" />
          <div className="h-6 w-48 bg-gray-800 rounded" />
          <div className="h-4 w-32 bg-gray-800 rounded" />
        </div>
        
        {/* Module Skeleton */}
        <div className="space-y-4 mt-8">
          <div className="h-32 w-full bg-gray-800 rounded-xl" />
          <div className="h-32 w-full bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
