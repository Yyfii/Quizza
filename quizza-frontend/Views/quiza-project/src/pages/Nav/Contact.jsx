import { useNavigate } from "react-router-dom"
import Info from '../../assets/info-2.png'
import './style/Contact.css'

const Contact = () => {
    const navigate = useNavigate()
    return(
        <div className="Contact">
            <h1 className="title-page">Contatos</h1>
            <span className="span"></span>
            <div className="contact-buttons">
                <div className="card info">
                    <div className="title-card">
                        <img src={Info} alt="info" />
                        <h1>Informações</h1>
                    </div>
                    <p>Gostaria de entre em contato com a nossa equipe? <br /> Você poderá ter acesso as nossas informações ao clicar no botão abaixo.  </p>
                    <button onClick={()=> navigate('info')}>Informação de Contato</button>
                </div>
                <div className="card form">
                    <div className="title-card">
                        <img src={Info} alt="info" />
                        <h1>Envie uma mensagem</h1>
                    </div>
                    <p>Quer enviar uma menssagem diretamente para nosso email?  <br /> Você poderá ter acesso a um formulário ao clicar no botão abaixo.  </p>
                    <button onClick={()=> navigate('form')}>Entre em Contato</button>
                </div>
            </div>
        </div>
    )
}

export default Contact