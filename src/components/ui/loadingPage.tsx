export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex items-center gap-2 justify-center">
      <div className="loader">
        <style jsx>{`
          .loader {
            border: 3px solid transparent;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 0.6s linear infinite;
            opacity: 0.8;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
      <p>Loading...</p>
    </div>
  );
}
