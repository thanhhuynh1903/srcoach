import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastPosition = 'top' | 'bottom';

interface ToastOptions {
  position?: ToastPosition;
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  props?: any;
}

const showToast = (
  title: string,
  content?: string,
  options: ToastOptions & {type: ToastType} = {
    type: 'success',
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
  },
) => {
  Toast.show({
    type: options.type,
    position: options.position || 'top',
    text1: title,
    text2: content,
    visibilityTime: options.visibilityTime || 4000,
    autoHide: options.autoHide !== false,
    topOffset: options.topOffset,
    bottomOffset: options.bottomOffset,
    ...options.props,
  });
};

const ToastUtil = {
  show: (
    title: string,
    content?: string,
    options?: ToastOptions & {type?: ToastType},
  ) =>
    showToast(title, content, {...options, type: options?.type || 'success'}),

  success: (title: string, content?: string, options?: ToastOptions) =>
    showToast(title, content, {...options, type: 'success'}),

  error: (title: string, content?: string, options?: ToastOptions) =>
    showToast(title, content, {...options, type: 'error'}),

  info: (title: string, content?: string, options?: ToastOptions) =>
    showToast(title, content, {...options, type: 'info'}),

  warning: (title: string, content?: string, options?: ToastOptions) =>
    showToast(title, content, {...options, type: 'warning'}),

  hide: () => Toast.hide(),
};

export default ToastUtil;
