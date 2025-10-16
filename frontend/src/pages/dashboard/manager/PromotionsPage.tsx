import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Calendar, Edit, Trash2 } from 'lucide-react';
import { PromotionDialog } from '@/components/manager/PromotionDialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = () => {
    const stored = localStorage.getItem('promotions');
    if (stored) {
      setPromotions(JSON.parse(stored));
    }
  };

  const savePromotion = (promotion: any) => {
    const updated = promotion.id && promotions.find(p => p.id === promotion.id)
      ? promotions.map(p => p.id === promotion.id ? promotion : p)
      : [...promotions, promotion];
    
    setPromotions(updated);
    localStorage.setItem('promotions', JSON.stringify(updated));
  };

  const deletePromotion = (id: string) => {
    const updated = promotions.filter(p => p.id !== id);
    setPromotions(updated);
    localStorage.setItem('promotions', JSON.stringify(updated));
    toast({
      title: 'Promotion deleted',
      description: 'The promotion has been removed',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'expired':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground mt-2">
            Manage promotional campaigns for your branch
          </p>
        </div>
        <PromotionDialog onSave={savePromotion} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>View and manage promotional campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No promotions yet. Create your first promotion to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo) => (
                <Card key={promo.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{promo.name}</h4>
                          <Badge>
                            {promo.discountType === 'percentage' 
                              ? `${promo.discountValue}% OFF`
                              : `$${promo.discountValue} OFF`
                            }
                          </Badge>
                        </div>
                        {promo.description && (
                          <p className="text-sm text-muted-foreground">{promo.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {promo.startDate} - {promo.endDate}
                          </span>
                          <Badge variant={getStatusVariant(promo.status)} className="text-xs">
                            {promo.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <PromotionDialog
                          promotion={promo}
                          onSave={savePromotion}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePromotion(promo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
