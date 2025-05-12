import React from 'react';
import {ToastAndroid} from 'react-native';

export const BackgroundService = async (taskData: any) => {
  console.log('[BackgroundTask] Running background task', taskData);

  let counter = 0;

  const showNotification = () => {
    counter++;
    ToastAndroid.show(
      `Background task running (${counter}) - ${
        taskData?.message || 'No data'
      }`,
      ToastAndroid.SHORT,
    );
    console.log(`[BackgroundTask] Notification shown (${counter})`);
  };

  showNotification();
  const intervalId = setInterval(showNotification, 10000);

  return () => {
    clearInterval(intervalId);
    console.log('[BackgroundTask] Background task stopped');
  };
};
