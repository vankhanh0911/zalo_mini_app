import React, {useState, useEffect} from "react";
import { Sheet, Button, Page, Text, useNavigate } from "zmp-ui";
import { closeApp } from "zmp-sdk/apis";

const ThankyouPage: React.FunctionComponent = (props) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      closeApp({
        success: (res) => {
          // xử lý khi gọi api thành công
          console.log(res);
        },
        fail: (error) => {
          // xử lý khi gọi api thất bại
          console.log(error);
        }
      });
    }
  }, [countdown]);

  return (
    <Page className="page">
      <div className="flex items-center justify-center h-screen">
      <div>
        <div className="flex flex-col items-center space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="text-green-600 w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-4xl font-bold">Thank You !</h1>
          <p>You data has been records.</p>
          <a
            className="inline-flex items-center px-4 py-2 text-white bg-indigo-600 border border-indigo-600 rounded rounded-full hover:bg-indigo-700 focus:outline-none focus:ring">
            <span className="text-sm font-medium">
              This app will be closed after {countdown} seconds
            </span>
          </a>
        </div>
      </div>
    </div>
    </Page>
  );
};

export default ThankyouPage;