import { useEffect, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./style/Job.scss";

import Designer from "../../assets/home/designer.jpg";
import Dev from "../../assets/home/developer.jpg";
import Editor from "../../assets/home/editor.jpg";
import Gamer from "../../assets/home/gamer.jpg";
import Marketer from "../../assets/home/marketer.jpg";

import { SearchBar } from "../../components/SearchBar";
import { SearchResultsList } from "../../components/SearchResultsList";

/*function Jobs(){
    const [jobs, setJobs] = useState([])

      //Get Function
    async function getUsers(){
        const jobsFromApi = await api.get('/jobs')
        setUsers(jobsFromApi.data)
        console.log(jobs)

    }
    useEffect(() => {
    getUsers()
    }
, [])*/

const vagas = [
  {
    img: Dev,
    badge: "Developer",
    description: "Lorem ipsum dolor sit amet consectetus adipising let.",
    salary: "3000",
    location: "Brazil, Piauí",
  },
  {
    img: Designer,
    badge: "Designer",
    description: "Lorem ipsum dolor sit amet consectetus adipising let.",
    salary: "3000",
    location: "Brazil, Piauí",
  },
  {
    img: Editor,
    badge: "Editor",
    description: "Lorem ipsum dolor sit amet consectetus adipising let.",
    salary: "3000",
    location: "Brazil, Piauí",
  },
  {
    img: Gamer,
    badge: "Gamer",
    description: "Lorem ipsum dolor sit amet consectetus adipising let.",
    salary: "3000",
    location: "Brazil, Piauí",
  },
  {
    img: Marketer,
    badge: "Marketer",
    description: "Lorem ipsum dolor sit amet consectetus adipising let.",
    salary: "3000",
    location: "Brazil, Piauí",
  },
];

const Jobs = () => {
  const [results, setResults] = useState([]);
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    document.body.classList.add("about-bg");
    return () => {
      document.body.classList.remove("about-bg");
    };
  }, []);

  return (
    <div className="jobs">
      <div className="lista">
        <h2>Vagas abertas</h2>
        <p>Lista das vagas que estão atualmente abertas na nossa stand-up.</p>
      </div>
      <div className="search-bar">
        <div className="search-bar-container">
          <SearchBar
            input={input}
            setInput={setInput}
            setResults={setResults}
            results={results}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
          <SearchResultsList
            results={results}
            setInput={setInput}
            setResults={setResults}
            selectedIndex={selectedIndex}
          />
        </div>
      </div>
      <div className="card-wrapper slider-wrapper ">
        <div className="card-list">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={"auto"}
            loop={true}
          >
            {vagas.map((vaga, index) => (
              <SwiperSlide className="card-item" key={index}>
                <a href="#" className="card-link">
                  <img src={vaga.img} alt="Card Image" className="card-image" />
                  <p className="badge">{vaga.badge}</p>
                  <h2 className="card-title">{vaga.description}</h2>
                  <h2 className="card-subtitles">
                    <span className="card-subtitle">R$ {vaga.salary}, 00</span>
                    <span className="card-subtitle">{vaga.location}</span>
                  </h2>
                  <button className="card-button">
                    <FaArrowRightLong />
                  </button>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
