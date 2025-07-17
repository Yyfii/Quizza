import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";

import ContactForm from "./components/ContactForm";
import ContactInfo from "./components/ContactInfo";
import NotFound from "./components/NotFound";
import ContactLayout from "./pages/layout/ContactLayout";
import JobsLayout from "./pages/layout/JobsLayout";
import RootLayout from "./pages/layout/RootLayout";
import AllQuiz from "./pages/Mern/AllQuiz";
import QuizResponder from "./pages/Mern/components/QuizResponder";
import PrivateRoute from "./pages/Mern/context/privateRoute";
import EmailVerify from "./pages/Mern/EmailVerify";
import List from "./pages/Mern/List";
import Login from "./pages/Mern/Login";
import NewQuiz from "./pages/Mern/NewQuiz";
import QuizDetail from "./pages/Mern/QuizDetail";
import QuizList from "./pages/Mern/QuizList";
import QuizRespostas from "./pages/Mern/QuizRespostas";
import Quiza from "./pages/Mern/Quizza";
import Register from "./pages/mern/register";
import ResetPassword from "./pages/Mern/ResetPassword";
import About from "./pages/Nav/About";
import Home from "./pages/Nav/Home";
import Jobs from "./pages/Nav/Jobs";
import Product from "./pages/Nav/Product";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Rotas SEM layout padrão */}
      <Route path="/register" element={<Register />} />
      <Route path="/quizza" element={<Quiza />} />
      <Route path="/login" element={<Login />} />
      <Route path="/email-verify" element={<EmailVerify />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      

      {/* Rotas protegidas */}
      <Route path="/quiz-list" element={
        <PrivateRoute>
          <QuizList />
        </PrivateRoute>
      } />
      <Route path="/new-quiz" element={
        <PrivateRoute>
          <NewQuiz />
        </PrivateRoute>
      } />
      <Route path="/quizzes/:id" element={
        <PrivateRoute>
          <QuizDetail />
        </PrivateRoute>
      } />
      <Route path="/quizzes/:id/responder" element={
        <PrivateRoute>
          <QuizResponder />
        </PrivateRoute>
      } />
      <Route path="/analise" element={
        <PrivateRoute>
          <QuizRespostas />
        </PrivateRoute>
      } />
      <Route path="/explorar" element={
        <PrivateRoute>
          <AllQuiz />
        </PrivateRoute>
      } />
      <Route path="/lista" element={
        <PrivateRoute>
          <List />
        </PrivateRoute>
      } />


      {/* Rotas COM layout padrão */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="product" element={<Product />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<ContactLayout />}>
          <Route path="info" element={<ContactInfo />} />
          <Route path="form" element={<ContactForm />} />
        </Route>
        <Route path="jobs" element={<JobsLayout />}>
          <Route index element={<Jobs />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

//Toast configuration
const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;
