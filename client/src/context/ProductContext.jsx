import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  createProductRequest,
  deleteProductRequest,
  fetchProductRequest,
  fetchProductsRequest,
  updateProductRequest,
} from '../lib/productApi';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const nextProducts = await fetchProductsRequest();
      setProducts(nextProducts);
      return nextProducts;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSingleProduct = useCallback(async (productId) => {
    setLoading(true);

    try {
      const nextProduct = await fetchProductRequest(productId);
      setCurrentProduct(nextProduct);
      return nextProduct;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (payload) => {
    const nextProduct = await createProductRequest(payload);
    setProducts((current) => [nextProduct, ...current]);
    return nextProduct;
  }, []);

  const updateProduct = useCallback(async (productId, payload) => {
    const nextProduct = await updateProductRequest(productId, payload);
    setProducts((current) => current.map((product) => (product._id === productId ? nextProduct : product)));
    setCurrentProduct(nextProduct);
    return nextProduct;
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    await deleteProductRequest(productId);
    setProducts((current) => current.filter((product) => product._id !== productId));
  }, []);

  const value = useMemo(
    () => ({
      products,
      currentProduct,
      loading,
      setProducts,
      setCurrentProduct,
      fetchProducts,
      fetchSingleProduct,
      createProduct,
      updateProduct,
      deleteProduct,
    }),
    [createProduct, currentProduct, deleteProduct, fetchProducts, fetchSingleProduct, loading, products, updateProduct]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error('useProducts must be used within ProductProvider.');
  }

  return context;
};