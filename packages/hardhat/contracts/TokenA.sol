// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
    Este contrato implementa un token ERC20 estándar llamado TokenA.
    Proporciona las funcionalidades básicas del estándar ERC20, incluyendo
    transferencia de tokens, aprobación de transferencias delegadas y una 
    función adicional para quemar tokens, lo cual reduce el suministro total.
*/
contract TokenA {

    /*
    Evento Transfer:
    Se emite cuando un token es transferido de una dirección a otra.
    Los parámetros son:
        - from: Dirección del remitente.
        - to: Dirección del destinatario.
        - value: Cantidad de tokens transferidos.
    */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /*
    Evento Approval:
    Se emite cuando un propietario aprueba a un tercero para gastar tokens en su nombre.
    Los parámetros son:
        - owner: Dirección del propietario de los tokens.
        - spender: Dirección del tercero autorizado.
        - value: Cantidad de tokens que el tercero puede gastar.
    */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /* 
    Variables de estado para el contrato.
        - name: Nombre del token, "TokenA".
        - symbol: Símbolo del token, "TKA".
        - decimals: Decimales del token (18).
        - totalSupply: Suministro total de tokens en existencia.
    */
    string public name = "TokenA";
    string public symbol = "TKA";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    /*
    Mapeos para el balance de tokens y las asignaciones de gasto:
    - balances: Guarda el balance de cada dirección.
    - allowances: Guarda la cantidad de tokens que un propietario permite que un tercero gaste.
    */
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    /*
    La dirección del owner del contrato, quien recibe el suministro inicial de tokens.
    */
    address public owner;

    /*
    El constructor inicializa el suministro de tokens.
    - _initialSupply: El suministro inicial de tokens que el propietario recibirá.
    Ajusta el suministro a los decimales y asigna el total al propietario.
    Emite un evento de transferencia desde la dirección 0 al propietario.
    */
    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply * 10 ** uint256(decimals); // Ajusta por los decimales
        balances[owner] = totalSupply;
        emit Transfer(address(0), owner, totalSupply);
    }

    /*
    Función balanceOf:
    Devueve el balance de tokens de una dirección.
    - account: La dirección para la cual se consulta el saldo.
    Retorna el balance de la dirección dada.
    */
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    /*
    Función transfer:
    Permite a un titular transferir tokens directamente a otra dirección.
    - to: Dirección del destinatario.
    - value: Cantidad de tokens a transferir.
    Requiere que el saldo del remitente sea suficiente y la cantidad sea mayor a cero.
    Emitirá un evento de transferencia.
    */
    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "Direccion invalida");
        require(value > 0, "La catidad debe se mayor a cero para tranferir ");
        require(balances[msg.sender] >= value, "Balance insuficiente");

        // Actualiza los balances
        balances[msg.sender] -= value; // Restar tokens del remitente
        balances[to] += value; // Emitir evento de transferencia

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /*
    Función approve:
    Permite a un propietario autorizar a un tercero a gastar una cantidad específica de sus tokens.
    - spender: Dirección del tercero autorizado.
    - value: Cantidad de tokens que el tercero puede gastar.
    Protege contra race conditions (condiciones de carrera) al asegurar que la asignación 
    anterior se haya establecido a cero antes de cambiar el valor.
    Emitirá un evento de aprobación.
    */
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0), "No se aprovo la direccion");

        // Protege contra race conditions
        require(
            allowances[msg.sender][spender] == 0 || value == 0,
            "La asignacion debe establecerce en cero antes de cambier de valor"
        );

        allowances[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }

    /*
    Función allowance:
    Devuelve cuántos tokens un tercero puede gastar en nombre del propietario.
    - tokenOwner: Dirección del propietario de los tokens.
    - spender: Dirección del tercero autorizado.
    Retorna la cantidad de tokens que el tercero puede gastar.
    */
    function allowance(address tokenOwner, address spender) public view returns (uint256) {
        return allowances[tokenOwner][spender];
    }

     /*
    Función transferFrom:
    Permite a un tercero transferir tokens de la cuenta de un propietario a otra cuenta.
    - from: Dirección del propietario de los tokens.
    - to: Dirección del destinatario de los tokens.
    - value: Cantidad de tokens a transferir.
    Requiere que el tercero tenga suficiente asignación y que el propietario tenga el saldo suficiente.
    Emitirá un evento de transferencia.
    */
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(to != address(0), "No se puede tranferir direccion de destinatario incorrecta");
        require(value > 0, "La tranferencia tiene que ser mayor a cero");
        require(balances[from] >= value, "No hay suficiente balance para la tranferencia");
        require(allowances[from][msg.sender] >= value, "Se exedio la asignacion");

        // Actualiza los balances y la asignación permitida
        balances[from] -= value;// Restar tokens del propietario
        balances[to] += value;  // Añadir tokens al destinatario
        allowances[from][msg.sender] -= value; // Reducir la asignación

        emit Transfer(from, to, value);
        return true;
    }

    /*
    Función burn:
    Permite a un titular quemar (destruir) una cantidad específica de sus tokens.
    - amount: Cantidad de tokens a quemar.
    Requiere que el titular tenga suficiente saldo y que la cantidad sea mayor a cero.
    Emitirá un evento de transferencia desde el titular hacia la dirección 0 (quema).
    */
    function burn(uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Saldo insuficiente para quemar");
        require(amount > 0, "El saldo debe ser mayo a cero para quemar");

        balances[msg.sender] -= amount; // Restar los tokens del titular
        totalSupply -= amount; // Reducir el suministro total

        emit Transfer(msg.sender, address(0), amount);
        return true;
    }
}
