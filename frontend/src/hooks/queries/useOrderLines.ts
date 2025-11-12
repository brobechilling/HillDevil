import { createOrderLine } from "@/api/orderLineApi"
import { useMutation } from "@tanstack/react-query"


export const useCreateOrderLine = () => {
  return useMutation({
    mutationFn: createOrderLine,
  });
};