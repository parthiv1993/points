import React from 'react';
import { Button, Row, Col, Table ,Card, Form} from 'react-bootstrap';


class Login extends React.Component {
    constructor(props){
        super(props);
        this.state= {
            name : ''
        }
    }

    onLoginClick(e){
        this.props.onLogin(this.state.name);
        e.preventDefault();
    }

    onInputChange(e){
        this.setState({
            name:e.target.value
        });
    }

    render(){
        return (
            // <div class="container d-flex h-100">
            // <div class="row justify-content-center align-self-center">
            <div style={{height:'-webkit-fill-available'}}>
            <Card style={ {
                    margin: 'auto',
                    width: '400px',
                    top: '25%',
                    bottom: '0'
                }}>
                <Card.Header>
                    Login
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={this.onLoginClick.bind(this)}>
                        <Form.Group controlId="formNickName">
                            <Form.Label>Nick Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter your given NickName" onChange={this.onInputChange.bind(this)}/>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    Don't have a login ? Contact Parthiv
                </Card.Footer>
            </Card>
            </div>
            // </div>
            // <div style={{margin:'auto'}}>
            //     <form>
            //         <label>
            //             NickName :
            //         </label>
            //         <input value={this.state.name} onChange={this.onInputChange.bind(this)}/>
            //         <button onClick={this.onLoginClick.bind(this)}>Login</button>
            //     </form>
            // </div>
        );
    }
}

export default Login;