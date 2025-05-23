import {PermissionsAndroid, Platform} from 'react-native';

export const isPermissionGranted = async (
  permission: string,
): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const hasPermission = await PermissionsAndroid.check(permission as any);
  return hasPermission;
};

export const grantPermission = async (
  ...permissions: string[]
): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      permissions as any,
    );
    return Object.values(granted).every(status => status === 'granted');
  } catch {
    return false;
  }
};

export const removePermission = async (
  ...permissions: string[]
): Promise<void> => {
  //Unsupported for now
};
