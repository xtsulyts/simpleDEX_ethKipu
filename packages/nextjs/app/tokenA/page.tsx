import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Token A",
  description: "Envio de tokens",
});

const TokenA: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Token A</h1>
      </div>
    </>
  );
};

export default TokenA;
