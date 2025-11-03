import { changePassword, getUsers, setUserStatus, updateUser } from "@/api/userApi";
import { PageResponse } from "@/dto/pageResponse";
import { UserDTO } from "@/dto/user.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


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
  return useMutation({
    mutationFn: changePassword,

  });
};

