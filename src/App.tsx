import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Resources from './pages/Resources';
import Quote from './pages/Quote';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Resource Articles
import ChoosingRightPallet from './pages/resources/ChoosingRightPallet';
import PalletGradesExplained from './pages/resources/PalletGradesExplained';
import RecyclingBenefits from './pages/resources/RecyclingBenefits';
import SustainabilityReport2024 from './pages/resources/SustainabilityReport2024';

// Portal Pages
import PortalDashboard from './pages/portal/Dashboard';
import PortalShop from './pages/portal/Shop';
import PortalCart from './pages/portal/Cart';
import PortalOrders from './pages/portal/Orders';
import PortalOrderDetail from './pages/portal/OrderDetail';
import PortalCheckout from './pages/portal/Checkout';
import PortalOrderConfirmation from './pages/portal/OrderConfirmation';
import PortalSettings from './pages/portal/Settings';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/quote" element={<Quote />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Resource Articles */}
      <Route path="/resources/choosing-right-pallet" element={<ChoosingRightPallet />} />
      <Route path="/resources/pallet-grades-explained" element={<PalletGradesExplained />} />
      <Route path="/resources/recycling-benefits" element={<RecyclingBenefits />} />
      <Route path="/resources/sustainability-report-2024" element={<SustainabilityReport2024 />} />

      {/* Portal Pages */}
      <Route path="/portal" element={<PortalDashboard />} />
      <Route path="/portal/shop" element={<PortalShop />} />
      <Route path="/portal/cart" element={<PortalCart />} />
      <Route path="/portal/orders" element={<PortalOrders />} />
      <Route path="/portal/orders/:id" element={<PortalOrderDetail />} />
      <Route path="/portal/checkout" element={<PortalCheckout />} />
      <Route path="/portal/order-confirmation" element={<PortalOrderConfirmation />} />
      <Route path="/portal/settings" element={<PortalSettings />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
