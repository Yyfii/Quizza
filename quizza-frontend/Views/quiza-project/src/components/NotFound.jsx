import { useNavigate } from "react-router-dom"
import Oops from '../assets/notFound.png'
import './NotFound.css'

const NotFound = () => {
    const navigate = useNavigate()
    return(
        <div className='NotFound'>
            <div className="elements">
                <div className="not">
                    <h2>404 | Página não encontrada</h2>
                    <div className="img">
                        <img src={Oops} alt="oops" />
                    </div>
                    <button onClick={()=> navigate('/')}>Voltar para Início</button>
                </div>
            </div>
        </div>
    )
}

export default NotFound