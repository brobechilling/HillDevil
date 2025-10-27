import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserDialog } from './UserDialog';
import { Search, HandMetal, Angry, Laugh } from 'lucide-react';
import { useUpdateUserMutation, useUsersPaginatedQuery } from '@/hooks/queries/useUsers';
import { UserDTO } from '@/dto/user.dto';
import { Input } from '../ui/input';

export const UserTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO>();

  const [page, setPage] = useState<number>(1);
  const size: number = 2;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data, isLoading, isError, isFetching } = useUsersPaginatedQuery(page,size);

  const filteredUsers: UserDTO[] = (data?.items ?? []).filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateUserMutation = useUpdateUserMutation(page, size); 

  const handleStatusUpdate = (user: UserDTO) => {
    const updatedUser = { ...user, status: !user.status };
    updateUserMutation.mutate(updatedUser);
  };

  const handleUserRestaurantInfo = (user: UserDTO) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Restaurant detail</TableHead>
                <TableHead className="text-right">Set status</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading && (
              <div className="text-center py-8">Loading registerd users...</div>
            )}

            {isError && (
              <div className="text-center py-8 text-red-500">Failed to load registerd users</div>
            )}
            {!isLoading && !isError && filteredUsers.length === 0 && (
              <div className="text-center py-8">No users found.</div>
            )}
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === true ? 'default' : 'secondary'}
                      className="cursor-pointer"
                    >
                      {user.status === true ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUserRestaurantInfo(user)}
                      >
                        <HandMetal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusUpdate(user)}
                      >
                        {user.status === true ? (<Laugh className="h-4 w-4" />) : (<Angry className="h-4 w-4" />)}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser ?? null}
      />
    </div>
  );
};
