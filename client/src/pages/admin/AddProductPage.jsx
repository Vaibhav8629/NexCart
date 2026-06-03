import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from '../../components/admin/ProductForm';
import { useProducts } from '../../context/ProductContext';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { createProduct } = useProducts();

  const handleCreate = async (payload) => {
    try {
      await createProduct(payload);
      toast.success('Product created successfully.');
      navigate('/admin/products', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to create product.');
      throw error;
    }
  };

  return <ProductForm title="Add Product" description="Create a new catalog item with multiple image URLs." submitLabel="Create Product" onSubmit={handleCreate} />;
}