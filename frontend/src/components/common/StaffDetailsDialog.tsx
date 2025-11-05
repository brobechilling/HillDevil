// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Eye, EyeOff, Copy, RefreshCw, AlertCircle } from "lucide-react";
// import { StaffAccountDTO } from "@/dto/staff.dto";
// import { useStaffAccountByIdQuery } from "@/hooks/queries/useStaff";
// import { useToast } from "@/hooks/use-toast";
// import { ROLE_NAME } from "@/dto/user.dto";
// import { resetStaffPassword, ResetPasswordRequest } from "@/api/staffApi";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// interface StaffDetailsDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   staffAccountId: string | null;
// }

// export const StaffDetailsDialog = ({
//   open,
//   onOpenChange,
//   staffAccountId,
// }: StaffDetailsDialogProps) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [newPassword, setNewPassword] = useState<string | null>(null); // Password mới sau khi reset
//   const [isResetting, setIsResetting] = useState(false);
//   const [showResetConfirm, setShowResetConfirm] = useState(false);
//   const [resetMode, setResetMode] = useState<'auto' | 'custom'>('auto'); // Mode: auto generate hoặc custom
//   const [customPassword, setCustomPassword] = useState('');
//   const [showCustomPassword, setShowCustomPassword] = useState(false);
//   const { toast } = useToast();
//   const { data: staffAccount, isLoading, refetch } = useStaffAccountByIdQuery(staffAccountId);

//   const getRoleBadgeVariant = (roleName: string) => {
//     switch (roleName) {
//       case ROLE_NAME.WAITER:
//         return "default";
//       case ROLE_NAME.RECEPTIONIST:
//         return "secondary";
//       case ROLE_NAME.BRANCH_MANAGER:
//         return "destructive";
//       default:
//         return "outline";
//     }
//   };

//   const handleCopyPassword = () => {
//     // Copy password mới nếu có, nếu không thì copy hash (nhưng sẽ hiển thị cảnh báo)
//     const passwordToCopy = newPassword || staffAccount?.password;
//     if (passwordToCopy) {
//       navigator.clipboard.writeText(passwordToCopy);
//       toast({
//         title: "Copied!",
//         description: newPassword 
//           ? "New password copied to clipboard" 
//           : "Password hash copied to clipboard",
//       });
//     }
//   };

//   const handleResetPassword = async () => {
//     if (!staffAccountId) return;
    
//     // Validate custom password nếu chọn custom mode
//     if (resetMode === 'custom') {
//       const trimmedPassword = customPassword.trim();
//       if (!trimmedPassword) {
//         toast({
//           variant: "destructive",
//           title: "Password required",
//           description: "Please enter a custom password or select auto generate mode.",
//         });
//         return;
//       }
//       if (trimmedPassword.length < 6) {
//         toast({
//           variant: "destructive",
//           title: "Invalid password",
//           description: "Password must be at least 6 characters long.",
//         });
//         return;
//       }
//     }
    
//     setIsResetting(true);
//     try {
//       const request: ResetPasswordRequest = resetMode === 'custom' && customPassword.trim()
//         ? { newPassword: customPassword.trim() }
//         : {};
      
//       const response = await resetStaffPassword(staffAccountId, request);
//       setNewPassword(response.newPassword);
      
//       // Lưu password gốc vào localStorage để có thể xem lại sau
//       const savedPasswordKey = `staff_password_${staffAccountId}`;
//       const savedPasswordData = {
//         password: response.newPassword,
//         timestamp: Date.now(),
//         username: response.username,
//       };
//       localStorage.setItem(savedPasswordKey, JSON.stringify(savedPasswordData));
      
//       // Refetch để cập nhật thông tin
//       refetch();
//       toast({
//         title: "Password reset successfully",
//         description: `New password has been ${resetMode === 'custom' ? 'set' : 'generated'} for ${response.username}. Please copy and share it securely. You can view this password again later.`,
//       });
//       setShowResetConfirm(false);
//       // Reset form
//       setResetMode('auto');
//       setCustomPassword('');
//       setShowCustomPassword(false);
//     } catch (error: any) {
//       console.error("Error resetting password:", error);
//       toast({
//         variant: "destructive",
//         title: "Error resetting password",
//         description: error?.response?.data?.message || error?.message || "Failed to reset password",
//       });
//     } finally {
//       setIsResetting(false);
//     }
//   };

//   // Load saved password từ localStorage khi mở dialog
//   useEffect(() => {
//     if (open && staffAccountId) {
//       // Kiểm tra xem có password đã được lưu cho staff account này không
//       const savedPasswordKey = `staff_password_${staffAccountId}`;
//       const savedPasswordData = localStorage.getItem(savedPasswordKey);
      
//       if (savedPasswordData) {
//         try {
//           const { password: savedPassword, timestamp } = JSON.parse(savedPasswordData);
//           // Chỉ hiển thị password nếu được lưu trong vòng 7 ngày (604800000 ms)
//           const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
//           if (timestamp && timestamp > sevenDaysAgo) {
//             setNewPassword(savedPassword);
//           } else {
//             // Xóa password cũ nếu quá 7 ngày
//             localStorage.removeItem(savedPasswordKey);
//           }
//         } catch (e) {
//           console.error('Error parsing saved password:', e);
//           localStorage.removeItem(savedPasswordKey);
//         }
//       }
//     } else {
//       // Reset form khi đóng dialog hoặc không có staffAccountId
//       setResetMode('auto');
//       setCustomPassword('');
//       setShowCustomPassword(false);
//     }
//   }, [open, staffAccountId]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Staff Account Details</DialogTitle>
//           <DialogDescription>
//             View complete information about this staff account
//           </DialogDescription>
//         </DialogHeader>

//         {isLoading ? (
//           <div className="text-center text-muted-foreground py-8">
//             Loading staff account details...
//           </div>
//         ) : staffAccount ? (
//           <div className="space-y-6">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label className="text-sm text-muted-foreground">Staff Account ID</Label>
//                 <p className="font-semibold mt-1 text-sm font-mono">
//                   {staffAccount.staffAccountId}
//                 </p>
//               </div>
//               <div>
//                 <Label className="text-sm text-muted-foreground">Username</Label>
//                 <p className="font-semibold mt-1">{staffAccount.username}</p>
//               </div>
//               <div>
//                 <Label className="text-sm text-muted-foreground">Role</Label>
//                 <div className="mt-1">
//                   <Badge variant={getRoleBadgeVariant(staffAccount.role.name)}>
//                     {staffAccount.role.name.replace("_", " ")}
//                   </Badge>
//                 </div>
//               </div>
//               <div>
//                 <Label className="text-sm text-muted-foreground">Status</Label>
//                 <div className="mt-1">
//                   <Badge variant={staffAccount.status ? "default" : "secondary"}>
//                     {staffAccount.status ? "Active" : "Inactive"}
//                   </Badge>
//                 </div>
//               </div>
//               <div className="col-span-2">
//                 <Label className="text-sm text-muted-foreground">Branch ID</Label>
//                 <p className="font-semibold mt-1 text-sm font-mono">
//                   {staffAccount.branchId}
//                 </p>
//               </div>
//               <div className="col-span-2">
//                 <div className="flex items-center justify-between mb-2">
//                   <Label className="text-sm text-muted-foreground">Password</Label>
//                   <Button
//                     type="button"
//                     variant="default"
//                     size="sm"
//                     onClick={() => setShowResetConfirm(true)}
//                     disabled={isResetting}
//                     className="gap-2 h-9 px-4 bg-primary hover:bg-primary/90"
//                   >
//                     <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
//                     Reset Password
//                   </Button>
//                 </div>
//                 {newPassword ? (
//                   <div className="space-y-2">
//                     <div className="flex gap-2">
//                       <div className="relative flex-1">
//                         <Input
//                           type={showPassword ? "text" : "password"}
//                           value={newPassword}
//                           readOnly
//                           className="font-mono text-xs pr-20 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
//                           onClick={() => setShowPassword(!showPassword)}
//                         >
//                           {showPassword ? (
//                             <EyeOff className="h-4 w-4" />
//                           ) : (
//                             <Eye className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </div>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={handleCopyPassword}
//                         className="gap-2"
//                       >
//                         <Copy className="h-4 w-4" />
//                         Copy
//                       </Button>
//                     </div>
//                     <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
//                       <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
//                       <p className="text-xs text-green-800 dark:text-green-200">
//                         <strong>Password available!</strong> This is the login password. Copy it now and share it securely with the staff member. This password will be saved for 7 days and can be viewed again later.
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
//                       <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
//                       <p className="text-sm text-muted-foreground">
//                         Password is hashed and cannot be displayed. Click <strong>"Reset Password"</strong> to generate a new password that can be used for login.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="text-center text-muted-foreground py-8">
//             Staff account not found
//           </div>
//         )}
//       </DialogContent>

//       <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
//         <AlertDialogContent className="max-w-md">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Reset Password</AlertDialogTitle>
//             <AlertDialogDescription>
//               Reset password for <strong>{staffAccount?.username}</strong>. The old password will no longer work.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
          
//           <div className="space-y-4 py-4">
//             {/* Reset Mode Selection */}
//             <div className="space-y-3">
//               <Label className="text-sm font-medium">Password Reset Mode</Label>
//               <RadioGroup value={resetMode} onValueChange={(value) => setResetMode(value as 'auto' | 'custom')}>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="auto" id="auto" />
//                   <Label htmlFor="auto" className="font-normal cursor-pointer flex-1">
//                     Auto Generate
//                     <span className="text-xs text-muted-foreground block mt-0.5">
//                       System will generate a secure random password
//                     </span>
//                   </Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="custom" id="custom" />
//                   <Label htmlFor="custom" className="font-normal cursor-pointer flex-1">
//                     Custom Password
//                     <span className="text-xs text-muted-foreground block mt-0.5">
//                       Enter your own password (min. 6 characters)
//                     </span>
//                   </Label>
//                 </div>
//               </RadioGroup>
//             </div>

//             {/* Custom Password Input */}
//             {resetMode === 'custom' && (
//               <div className="space-y-2 animate-fade-in">
//                 <Label htmlFor="customPasswordInput">New Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="customPasswordInput"
//                     type={showCustomPassword ? "text" : "password"}
//                     value={customPassword}
//                     onChange={(e) => setCustomPassword(e.target.value)}
//                     placeholder="Enter new password (min. 6 characters)"
//                     className="pr-10"
//                     disabled={isResetting}
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
//                     onClick={() => setShowCustomPassword(!showCustomPassword)}
//                     disabled={isResetting}
//                   >
//                     {showCustomPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//                 {customPassword && customPassword.length < 6 && (
//                   <p className="text-xs text-destructive">
//                     Password must be at least 6 characters long
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           <AlertDialogFooter>
//             <AlertDialogCancel 
//               disabled={isResetting}
//               onClick={() => {
//                 setResetMode('auto');
//                 setCustomPassword('');
//                 setShowCustomPassword(false);
//               }}
//             >
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleResetPassword}
//               disabled={isResetting || (resetMode === 'custom' && (!customPassword.trim() || customPassword.trim().length < 6))}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {isResetting ? (
//                 <>
//                   <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                   Resetting...
//                 </>
//               ) : (
//                 "Reset Password"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <style>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out forwards;
//         }
//       `}</style>
//     </Dialog>
//   );
// };

