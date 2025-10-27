import { getUsers, updateUser } from "@/api/userApi";
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

// admin update user
export const useUpdateUserMutation = (page: number, size: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", page, size] , exact: true}); 
    },
  });
};


// user update profile/user