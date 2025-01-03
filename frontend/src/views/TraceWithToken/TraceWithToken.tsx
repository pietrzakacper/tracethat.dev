import { Header } from "@/components/Header";
import { useEventsList } from "@/hooks/useEventsList";
import { EventsList } from "@/layouts/EventsList/EventsList";
import { Snippet } from "@/components/Snippet/Snippet";
import { useToken } from "@/hooks/useToken";

export function TraceWithToken() {
  const [token] = useToken();
  const { data, clearData } = useEventsList(token!);

  return (
    <div className="w-full h-full flex flex-col">
      <Header onClear={clearData} />
      <div className="w-full flex-1 min-h-0">
        <EventsList
          data={data}
          viewerPlaceholder={
            <div className="min-h-0 min-w-0 flex flex-col">
              <div className="flex flex-1 flex-col p-4 overflow-auto">
                <Snippet token={token!} />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
