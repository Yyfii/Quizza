import { Outlet } from 'react-router-dom';
import Footer from '../../components/Footer';
import Navbar from "../../components/Navbar";

const RootLayout = () => {
    return (
        <div className="layout">
            <Navbar />
            <main className="content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default RootLayout;
