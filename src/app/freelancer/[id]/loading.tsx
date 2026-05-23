export default function FreelancerProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[#305CDE]/20 border-t-[#305CDE]" />
      <p className="mb-2 text-center text-xl font-bold text-[#305CDE]">
        Elev8U
      </p>
      <p className="text-center text-sm text-gray-400">Loading profile...</p>
    </div>
  );
}
