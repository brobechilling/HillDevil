import { changePassword, forgetPassword, getUsers, sendMailVerification, setUserStatus, updateUser, validateOTP, getAllUsers } from "@/api/userApi";
import { PageResponse } from "@/dto/pageResponse";
import { UserDTO } from "@/dto/user.dto";
import { useSessionStore } from "@/store/sessionStore";
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from "axios";
import { ApiResponse } from "@/dto/apiResponse";

export const useUsersPaginatedQuery = (page: number, size: number) => {
  return useQuery<PageResponse<UserDTO>, Error>({
    queryKey: ["users", page, size],
    queryFn: () => getUsers(page, size),
    // staleTime: 1000 * 60 * 2,
  });
};

// admin update user status
export const useSetUserStatusMutation = (page: number, size: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", page, size] , exact: true}); 
    },
  });
};


export const useChangePasswordd = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: 'Password updated successfully',
        description: 'Your account password has been updated successfully',
      });
    },
    onError(error: AxiosError<ApiResponse<null>>) {
      const message = error.response?.data?.message || "Unexpected error occured. Please try again";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
  });
};

export const useUpdateUserProfile = () => {
  const { updateUser: updatedUserStore } = useSessionStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data)  => {
      updatedUserStore(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message = error.response?.data?.message || "Unexpected error occured. Please try again";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
    
  });
};

export const useVerifyMail = () => {
  return useMutation({
    mutationFn: sendMailVerification,
  });
};


export const useValidateOTP = () => {
  return useMutation({
    mutationFn: validateOTP, 
  });
};


export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgetPassword,

  });
};

export const useAllUsers = () => {
  return useQuery<UserDTO[]>({
    queryKey: ['all-users'],
    queryFn: () => getAllUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
