import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/authApi';
import { register} from '@/api/userApi';

export const useLogin = (options?: any) => {
  return useMutation({
    mutationFn: (payload: any) => login(payload),
    ...options,
  });
};

export const useRegister = (options?: any) => {
  return useMutation({
    mutationFn: (payload: any) => register(payload),
    ...options,
  });
};
