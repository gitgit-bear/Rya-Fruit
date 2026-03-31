import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Process } from "./pages/Process";
import { Delivery } from "./pages/Delivery";
import { Contact } from "./pages/Contact";
import { Gallery } from "./pages/Gallery";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="process" element={<Process />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="contact" element={<Contact />} />
                      <Route path="gallery" element={<Gallery />} />
          </Route>
          <Route path="admin" element={<Admin />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
