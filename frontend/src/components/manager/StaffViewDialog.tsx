import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  username?: string;
  branchId?: string;
  createdAt?: string;
  avatar?: string;
  address?: string;
  joinDate?: string;
}

interface StaffViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  onEdit?: (staff: Staff) => void;
  onDelete?: (staffId: string) => void;
}

export const StaffViewDialog = ({
  open,
  onOpenChange,
  staff,
  onEdit,
  onDelete
}: StaffViewDialogProps) => {
  const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
  const getBranchLabel = (branchId?: string) => {
    if (!branchId) return '';
    const b = branches.find((br: any) => br.id === branchId);
    if (!b) return branchId;
    return b.shortCode ? `${b.name} (${b.shortCode})` : b.name;
  };
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'waiter':
        return 'default';
      case 'receptionist':
        return 'secondary';
      case 'manager':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Staff Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff members found
            </div>
          ) : (
            <div className="grid gap-4">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{member.name}</h4>
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(member.status)}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEdit(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDelete(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {member.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.username && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Username:</span>
                            <span className="font-mono">{member.username}</span>
                          </div>
                        )}
                        {member.branchId && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Branch:</span>
                            <span>{getBranchLabel(member.branchId)}</span>
                          </div>
                        )}
                        {member.createdAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{new Date(member.createdAt).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-mono">{member.id}</span>
                        </div>
                        {member.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{member.address}</span>
                          </div>
                        )}
                        {member.joinDate && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
