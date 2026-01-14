import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    displayOrder: "",
  });

  const utils = trpc.useUtils();
  const { data: categories = [], isLoading } = trpc.categories.list.useQuery();

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الفئة بنجاح");
      utils.categories.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة الفئة");
    },
  });

  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الفئة بنجاح");
      utils.categories.list.invalidate();
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الفئة");
    },
  });

  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفئة بنجاح");
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الفئة");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "",
      displayOrder: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      icon: formData.icon || undefined,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : undefined,
    };

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...data });
    } else {
      createCategory.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      displayOrder: category.displayOrder?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع المنتجات المرتبطة بها.")) {
      deleteCategory.mutate(id);
    }
  };

  const CategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم الفئة</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">الرابط (Slug)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
          required
          placeholder="cars"
        />
        <p className="text-xs text-muted-foreground">سيتم استخدامه في الرابط: /category/{formData.slug || "slug"}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">الأيقونة (Emoji)</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🚗"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayOrder">ترتيب العرض</Label>
          <Input
            id="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={createCategory.isPending || updateCategory.isPending}>
        {(createCategory.isPending || updateCategory.isPending) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {editingCategory ? "تحديث الفئة" : "إضافة الفئة"}
      </Button>
    </form>
  );

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إدارة الفئات</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              إضافة فئة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد فئات</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الأيقونة</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الرابط</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-2xl">{category.icon || "📦"}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.displayOrder || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        category.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {category.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteCategory.isPending}
                        >
                          {deleteCategory.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الفئة</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
