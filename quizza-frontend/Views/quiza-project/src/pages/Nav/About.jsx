import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Ana from "../../assets/ana-about.jpeg";
import Carl from "../../assets/carl.jpg";
import Joel from "../../assets/joel.jpg";
import John from "../../assets/john.jpg";
import Mary from "../../assets/mary.jpg";
import Musavi from "../../assets/musavi.jpg";
import Radish from "../../assets/radish.jpg";
import Theo from "../../assets/theo.jpg";


import s1 from "../../assets/slides/1.png";
import s2 from "../../assets/slides/2.png";
import s3 from "../../assets/slides/3.png";
import s4 from "../../assets/slides/4.png";
import s5 from "../../assets/slides/5.png";
import "./style/About.scss";

const users = [
  { img: Ana, name: "Ana Soares", role: "Full-Stack Dev" },
  { img: Theo, name: "Theo Irlan", role: "Dev Cybersecurity" },
  { img: John, name: "John Noel", role: "Front-End Developer" },
  { img: Mary, name: "Mary Montana", role: "Back-End Developer" },
  { img: Carl, name: "Carl El", role: "Tech Leader" },
  { img: Musavi, name: "Musavi Mohamed", role: "SRE" },
  { img: Joel, name: "Joel Themoty", role: "Data Scientist" },
  { img: Radish, name: "Radish Esperanza", role: "UX Designer" },
];

const About = () => {
  return (
    <div className="about">
      <div className="text">
        <span>Nossa História</span>
        <span className="span"></span>
      </div>
      <div className="history-swiper-wrapper">
        <Swiper
            className="history-swiper"
            slidesPerView={1}
            centeredSlides={true}
            spaceBetween={0}
            navigation
            pagination={{ type: "progressbar" }}
            modules={[Pagination, Navigation]}
        >
          <SwiperSlide>
            <img src={s1} alt="s1" className="slide-img"/>
          </SwiperSlide>
          <SwiperSlide>
            <img src={s2} alt="s2"className="slide-img" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={s3} alt="s3" className="slide-img"/>
          </SwiperSlide>
          <SwiperSlide>
            <img src={s4} alt="s4" className="slide-img" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={s5} alt="s5" className="slide-img"/>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="text">
        <span>Criadores</span>
        <span className="span"></span>
      </div>
      <div className="slider-wrapper">
        <div className="card-list">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={"auto"}
            loop={true}
          >
            {users.map((user, index) => (
              <SwiperSlide key={index} className="card-item">
                <img src={user.img} className="user-image" alt={user.name} />
                <h2 className="user-name">{user.name}</h2>
                <p className="user-profession">{user.role}</p>
                <button type="button" className="message-button">
                  Mensagem
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default About;
