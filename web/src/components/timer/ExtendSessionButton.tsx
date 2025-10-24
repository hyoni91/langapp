import { useExtendSession } from "./useExtendSession";


type Props = {
    sessionId : string; //必ず必要
    minutes? : number;
    className? : string;
    onDone? : ()=>void;
}

export default function ExtendSessionButton({
    sessionId,
    minutes = 5, //5分指定
    className,
    onDone,
}:Props){

    const { extend, loading } = useExtendSession({ sessionId });

    //sessionId どこで？

   return (
    <button
      disabled={loading}
      onClick={async () => {
        await extend(minutes);
        onDone?.();
      }}
      className={className ?? "rounded-xl px-4 py-2 border"}
    >
      {loading ? "延長中..." : `${minutes}分延長`}
    </button>
  );
}