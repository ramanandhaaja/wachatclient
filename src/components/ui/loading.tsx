export default function Loading() {
  return (
    <div className="h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-lg shadow-sm">
      <div className="w-full pt-12 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </div>
  );
}
