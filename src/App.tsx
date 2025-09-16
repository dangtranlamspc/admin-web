import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/auth/Login";
import { authApi } from "./api/authApi";
import MainLayout from "./components/MainLayout";
import UserList from "./pages/user/userList";
import type { JSX } from "react";
import DashboardPage from "./pages/DashboardPage";
import ProductPage from "./pages/product/ProductPage";
import CategoryPage from "./pages/category/CategoryPage";
import SliderPage from "./pages/slider/SliderPage";
import CategoryBSCTPage from "./pages/bsct/categoryBSCT";
import BSCTAdmin from "./pages/bsct/BSCTList";
import CategoryThuVienPage from "./pages/thuvien/categoryThuVien";
import ThuVienList from "./pages/thuvien/ThuVienList";
import CategoryNNDTPage from "./pages/nndt/categoryNNDT";
import ListNNDTPage from "./pages/nndt/ListNNDTPage";
import CategoryCTGDPage from "./pages/ctgd/CategoryCTGDPage";
import ListCTGDPage from "./pages/ctgd/ListCTGDPage";
import CategoryTinTucPage from "./pages/tintuc/CategoryTinTucPage";
import TinTucAdmin from "./pages/tintuc/ListTinTucPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const user = authApi.getCurrentUser();
  return user ? children : <Navigate to="/login" />;
}


export default function App() {
  const user = authApi.getCurrentUser();

  return (

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Route trong layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout user={user}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/categories" element={<CategoryPage />} />
                  <Route path="/categoriesBSCT" element={<CategoryBSCTPage />} />
                  <Route path="/bscts" element={<BSCTAdmin />} />
                  <Route path="sliders" element={<SliderPage />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="categoriesThuVien" element={<CategoryThuVienPage/>} />
                  <Route path="thuviens" element={<ThuVienList/>} />
                  <Route path="/categoriesNNDT" element={<CategoryNNDTPage/>} />
                  <Route path="/nndts" element={<ListNNDTPage/>} />
                  <Route path="/categoryCTGD" element={<CategoryCTGDPage/>} />
                  <Route path="/ctgds" element={<ListCTGDPage/>} />
                  <Route path="/categoryTinTuc" element={<CategoryTinTucPage/>} />
                  <Route path="/tintucs" element={<TinTucAdmin/>} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
  );
}

