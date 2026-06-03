import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from '../../components/admin/ProductForm';
import { useProducts } from '../../context/ProductContext';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, fetchSingleProduct, updateProduct, loading } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSingleProduct(id);
  }, [fetchSingleProduct, id]);

  const handleUpdate = async (payload) => {
    setIsSubmitting(true);

    try {
      await updateProduct(id, payload);
      toast.success('Product updated successfully.');
      navigate('/admin/products', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to update product.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !currentProduct || currentProduct._id !== id) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-300">Loading product...</div>;
  }

  return <ProductForm title="Edit Product" description="Update the product details and image URLs." initialValues={currentProduct} submitLabel="Update Product" onSubmit={handleUpdate} isSubmitting={isSubmitting} />;
}