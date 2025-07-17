import './Contact.css'
const ContactForm = () => {
    return(
        <div>
            
            <form className="form-contact">
                <h2>Dúvidas | Mensagens</h2>
                <span className="span"></span>
                <input type="text" placeholder="Nome"/>
                <input type="email" placeholder="E-mail"/>
                <br />
                <textarea placeholder="Mensagem"></textarea>
                <br />
                <button type="submit">Enviar</button>
            </form>
        </div>
    )
}

export default ContactForm