import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  brand: '',
  stock: '',
  image1: '',
  image2: '',
  image3: '',
  featured: false,
};

const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Grocery'];

const mapInitialValues = (initialValues) => ({
  name: initialValues?.name || '',
  description: initialValues?.description || '',
  price: initialValues?.price ?? '',
  discountPrice: initialValues?.discountPrice ?? '',
  category: initialValues?.category || '',
  brand: initialValues?.brand || '',
  stock: initialValues?.stock ?? '',
  image1: initialValues?.images?.[0] || '',
  image2: initialValues?.images?.[1] || '',
  image3: initialValues?.images?.[2] || '',
  featured: Boolean(initialValues?.featured),
});

export default function ProductForm({ title, description, initialValues, onSubmit, submitLabel, isSubmitting }) {
  const [formData, setFormData] = useState(() => (initialValues ? mapInitialValues(initialValues) : emptyForm));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Product name is required.';
    if (!formData.description.trim()) nextErrors.description = 'Description is required.';
    if (formData.price === '' || Number(formData.price) < 0) nextErrors.price = 'Valid price is required.';
    if (!formData.category.trim()) nextErrors.category = 'Category is required.';
    if (formData.stock === '' || Number(formData.stock) < 0) nextErrors.stock = 'Valid stock quantity is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      discountPrice: formData.discountPrice === '' ? 0 : Number(formData.discountPrice),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      stock: Number(formData.stock),
      images: [formData.image1, formData.image2, formData.image3].filter(Boolean),
      featured: formData.featured,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm text-slate-300">Product Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Wireless Headphones" />
            {errors.name && <p className="text-sm text-rose-300">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-300">Description</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Premium sound and long battery life." />
            {errors.description && <p className="text-sm text-rose-300">{errors.description}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Price</label>
              <Input name="price" type="number" min="0" value={formData.price} onChange={handleChange} placeholder="99.99" />
              {errors.price && <p className="text-sm text-rose-300">{errors.price}</p>}
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Discount Price</label>
              <Input name="discountPrice" type="number" min="0" value={formData.discountPrice} onChange={handleChange} placeholder="79.99" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Category</label>
              <Select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </Select>
              {errors.category && <p className="text-sm text-rose-300">{errors.category}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Brand</label>
              <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="NexAudio" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Stock Quantity</label>
              <Input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} placeholder="25" />
              {errors.stock && <p className="text-sm text-rose-300">{errors.stock}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Image URL 1</label>
              <Input name="image1" value={formData.image1} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Image URL 2</label>
              <Input name="image2" value={formData.image2} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Image URL 3</label>
              <Input name="image3" value={formData.image3} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <Checkbox name="featured" checked={formData.featured} onChange={handleChange} />
            Featured Product
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-w-40">
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}