import useGetSummary from "./hooks/use-get-summary";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateDocumentTitle } from "@/hooks";
import { User, Briefcase, Heart, MessageSquare, Loader } from "lucide-react";
import UpdateSummary from "./components/update-summary";
import { URLS } from "@/constants";

function Profile() {
  const { isPending, data, refetch } = useGetSummary();
  useUpdateDocumentTitle({ title: `Profile - ${URLS.LOGO_TEXT}` });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full py-4 flex-col">
        <Loader className="animate-spin" size={15} />
        <span>Fetching user summary please wait!</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        No data found
      </div>
    );
  }

  return (
    <div className="md:w-[816px] container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader className={"w-full flex items-center justify-between"}>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
              <UpdateSummary
                summary={data?.summary}
                title={"Personal Details"}
                name={"personal_details"}
                refetch={refetch}
              />
            </CardHeader>
            <CardContent>
              {data?.summary?.personal_details ? (
                <p className="text-sm">{data?.summary?.personal_details}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No personal details available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={"w-full flex items-center justify-between"}>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Details
              </CardTitle>
              <UpdateSummary
                summary={data?.summary}
                name={"professional_details"}
                title={"Professional Details"}
                refetch={refetch}
              />
            </CardHeader>
            <CardContent>
              {data?.summary?.professional_details ? (
                <p className="text-sm">{data?.summary?.professional_details}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No professional details available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={"w-full flex items-center justify-between"}>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Interests
              </CardTitle>
              <UpdateSummary
                summary={data?.summary}
                name={"interests"}
                title={"Interests"}
                refetch={refetch}
              />
            </CardHeader>
            <CardContent>
              {data?.summary?.interests ? (
                <p className="text-sm">{data?.summary?.interests}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No interests listed
                </p>
              )}
            </CardContent>
          </Card>

          {/* User Preferences */}
          <Card>
            <CardHeader className={"w-full flex items-center justify-between"}>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Preferences
              </CardTitle>
              <UpdateSummary
                summary={data?.summary}
                name={"user_preference"}
                title={"User Preferences"}
                refetch={refetch}
              />
            </CardHeader>
            <CardContent>
              {data?.summary?.user_preference ? (
                <p className="text-sm">{data?.summary?.user_preference}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No preferences specified
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
