//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    * Interfaz estándar de ERC20:
    * Define las funciones mínimas que un contrato de token ERC20 debe implementar, como:
    * - transfer: para mover tokens entre cuentas.
    * - approve y allowance: para gestionar permisos de gasto entre contratos o cuentas.
    * - transferFrom: para transferir tokens usando la autorización previa mediante approve.
    * 
    * totalSupply:
     * - Devuelve la cantidad total de tokens emitidos por el contrato.
     * - Incluye tanto los tokens en circulación como los que están retenidos en contratos o cuentas específicas.
    * balanceOf:
     * - Devuelve el balance actual de tokens de una cuenta específica.
     * - Parámetro:
     *      - account: Dirección de la cuenta cuyo balance se desea consultar.
     * - Salida:
     *      - uint256: Cantidad de tokens que posee la cuenta especificada.
     * allowance:
     * - Devuelve la cantidad de tokens que un propietario ha permitido que otro gastador utilice en su nombre.
     * - Parámetros:
     *      - owner: Dirección del propietario de los tokens.
     *      - spender: Dirección de la cuenta autorizada para gastar los tokens.
     * - Salida:
     *      - uint256: Cantidad de tokens que el gastador tiene permiso para usar.
    * Se utiliza esta interfaz para interactuar con los contratos de los tokens TokenA y TokenB.
*/
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract SimpleDEX {

    // Direcciones de los tokens que serán intercambiados en el DEX.
    // Estas direcciones se establecen al momento de desplegar el contrato.
    address public tokenA; //Direccion del token A
    address public tokenB; //Direccion del token B

    // Variables de estado que almacenan las reservas actuales de TokenA y TokenB en el pool.
    uint256 public reserveA; //Reserva actual del token A en el pool.
    uint256 public reserveB; //Reserva actual del token B en el pool.

    /*
    * Eventos para registrar las operaciones importantes:
    * - LiquidityAdded: Emitido cuando se agrega liquidez al pool.
    * - LiquidityRemoved: Emitido cuando se elimina liquidez del pool.
    * - Swapped: Emitido cuando ocurre un intercambio de tokens.
    * - Price: Emitido para registrar el precio actual de los tokens.
    */

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
    event Swapped(address indexed swapper, address indexed tokenIn, uint256 amountIn, uint256 amountOut);
    event Price(uint256 priceTokenA, uint256 priceTokenB);

    /*
    * Constructor:
    * - Inicializa el contrato con las direcciones de TokenA y TokenB.
    * - Valida que las direcciones de los tokens no sean la dirección cero.
    */

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Direecion de token invalida");
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    /*
    * addLiquidity:
    * - Permite a los usuarios agregar liquidez al pool proporcionando una cantidad específica de TokenA y TokenB.
    * - Las cantidades deben ser positivas y los tokens se transfieren desde el usuario al contrato.
    * - Las reservas internas (reserveA y reserveB) se actualizan después de la transferencia.
    * - Emite un evento LiquidityAdded con los detalles de la operación.
    */
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Las cantidades deben ser mayores a cero");

        // Transferencia de los tokens desde el proveedor al contrato.
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        // Actualización de las reservas del pool.
        reserveA += amountA;
        reserveB += amountB;

        // Registro del evento de adición de liquidez.
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    /*
    * removeLiquidity:
    * - Permite a los usuarios retirar liquidez del pool en forma de TokenA y TokenB.
    * - Las cantidades a retirar deben ser menores o iguales a las reservas actuales.
    * - Las reservas internas se reducen según las cantidades retiradas.
    * - Los tokens se transfieren desde el contrato al usuario.
    * - Emite un evento LiquidityRemoved con los detalles de la operación.
    */
    function removeLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Las cantidades deben ser mayores a cero");
        require(reserveA >= amountA && reserveB >= amountB, "No hay suficiente liquidez para eliminar");

        // Reducción de las reservas del pool.
        reserveA -= amountA;
        reserveB -= amountB;

        // Transferencia de los tokens al proveedor de liquidez.
        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);

        // Registro del evento de eliminación de liquidez.
        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    /*
    * swapAforB:
    * - Permite a los usuarios intercambiar una cantidad de TokenA por TokenB.
    * - Calcula la cantidad de TokenB que debe enviarse al usuario basado en la fórmula del producto constante:
    *   (x + dx) * (y - dy) = x * y
    *   Donde:
    *     x = reserva actual de TokenA.
    *     y = reserva actual de TokenB.
    *     dx = cantidad de TokenA proporcionada por el usuario.
    *     dy = cantidad de TokenB a enviar al usuario.
    * - Actualiza las reservas del pool después del intercambio.
    * - Emite un evento Swapped con los detalles de la operación.
    */
    function swapAforB(uint256 amountAIn) external returns (uint256 amountBOut) {
        require(amountAIn > 0, "El importe de entrada debe ser mayor a cero");

        // Cálculo de las nuevas reservas usando la fórmula del producto constante.
        uint256 newReserveA = reserveA + amountAIn;
        uint256 newReserveB = (reserveA * reserveB) / newReserveA;
        amountBOut = reserveB - newReserveB;

        require(amountBOut > 0, "Cantidad de salida debe ser mayor a cero");

        // Transferencia del TokenA desde el usuario al contrato.
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountAIn);

        // Transferencia del TokenB desde el contrato al usuario.
        IERC20(tokenB).transfer(msg.sender, amountBOut);

        // Actualización de las reservas.
        reserveA = newReserveA;
        reserveB = newReserveB;

        emit Swapped(msg.sender, tokenA, amountAIn, amountBOut);
    }

    /*
    * swapBforA:
    * - Permite a los usuarios intercambiar una cantidad de TokenB por TokenA.
    * - Aplica la fórmula del producto constante para determinar la cantidad de TokenA que se enviará al usuario:
    *   (x - dx) * (y + dy) = x * y
    *   Donde:
    *     x = reserva actual de TokenA.
    *     y = reserva actual de TokenB.
    *     dy = cantidad de TokenB proporcionada por el usuario.
    *     dx = cantidad de TokenA a enviar al usuario.
    * - Actualiza las reservas del pool después del intercambio.
    * - Emite un evento Swapped con los detalles de la operación.
    */
    function swapBforA(uint256 amountBIn) external returns (uint256 amountAOut) {
        require(amountBIn > 0, "El importe de entrada debe ser mayor a cero");

        // Cálculo de las nuevas reservas usando la fórmula del producto constante.
        uint256 newReserveB = reserveB + amountBIn;
        uint256 newReserveA = (reserveA * reserveB) / newReserveB;
        amountAOut = reserveA - newReserveA;

        require(amountAOut > 0, "Cantidad de salida debe ser mayor a cero");

        // Transferencia del TokenB desde el usuario al contrato.
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBIn);

        // Transferencia del TokenA desde el contrato al usuario.
        IERC20(tokenA).transfer(msg.sender, amountAOut);

        // Actualización de las reservas.
        reserveA = newReserveA;
        reserveB = newReserveB;

        // Registro del evento de intercambio.
        emit Swapped(msg.sender, tokenB, amountBIn, amountAOut);
    }

    /*
    * getPrice:
    * - Devuelve el precio actual de un token en términos del otro token dentro del pool.
    * - Calcula el precio utilizando las reservas actuales y ajustando con un factor de precisión (10^18) para evitar errores por decimales.
    * - El precio de TokenA se calcula como: (reserveB * 10^18) / reserveA.
    * - El precio de TokenB se calcula como: (reserveA * 10^18) / reserveB.
    * - La función valida que la dirección proporcionada corresponda a uno de los tokens configurados en el contrato.
    */
    function getPrice(address _token) external view returns (uint256 price) {
        require(_token == tokenA || _token == tokenB, "Direccion de token invalida");

        if (_token == tokenA) {
            price = (reserveB * 10**18) / reserveA;
        } else {
            price = (reserveA * 10**18) / reserveB;
        }

        return price;// Devuelve el precio calculado.
    }
}
