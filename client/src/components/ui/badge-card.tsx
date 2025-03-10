import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BadgeCardProps = {
  name: string;
  description: string;
  image: string;
  earnedAt: string;
};

export function BadgeCard({ name, description, image, earnedAt }: BadgeCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <span className="text-4xl">{image}</span>
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <p className="text-xs text-muted-foreground">
          Earned on {new Date(earnedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
