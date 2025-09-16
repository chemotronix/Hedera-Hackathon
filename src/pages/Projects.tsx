import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Upload, MapPin, Calendar, Users } from "lucide-react";

const Projects = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Project Verification
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit and verify carbon credit projects
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="gradient-hero text-primary-foreground"
          >
            Submit New Project
          </Button>
        </div>

        {/* New Project Form */}
        {showForm && (
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Submit New Project for Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input id="projectName" placeholder="e.g., Solar Farm Alpha" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="projectType">Project Type</Label>
                    <Input id="projectType" placeholder="e.g., Solar Energy, Wind Power" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., California, USA" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Expected Capacity (tCO2/year)</Label>
                    <Input id="capacity" type="number" placeholder="1000" className="mt-1" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe your carbon credit project..."
                      className="mt-1 h-32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="documents">Supporting Documents</Label>
                    <Input id="documents" type="file" multiple className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload environmental impact assessments, certifications, etc.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit for Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              name: "Solar Farm Alpha",
              type: "Solar Energy",
              location: "California, USA",
              capacity: "1,200 tCO2/year",
              status: "verified",
              credits: 850,
              operator: "GreenEnergy Corp"
            },
            {
              name: "Wind Project Beta",
              type: "Wind Power",
              location: "Texas, USA",
              capacity: "800 tCO2/year",
              status: "pending",
              credits: 0,
              operator: "WindTech Solutions"
            },
            {
              name: "Forest Conservation",
              type: "Reforestation",
              location: "Brazil",
              capacity: "2,000 tCO2/year",
              status: "verified",
              credits: 1450,
              operator: "EcoForest Initiative"
            },
            {
              name: "Biogas Facility",
              type: "Methane Capture",
              location: "Denmark",
              capacity: "600 tCO2/year",
              status: "under_review",
              credits: 0,
              operator: "BioGas Nordic"
            }
          ].map((project, index) => (
            <Card key={index} className="gradient-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.type}</p>
                  </div>
                  <Badge 
                    variant={project.status === "verified" ? "default" : "secondary"}
                    className={
                      project.status === "verified" 
                        ? "bg-success" 
                        : project.status === "pending" 
                        ? "bg-yellow-500" 
                        : "bg-blue-500"
                    }
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Capacity: {project.capacity}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {project.operator}
                  </div>
                </div>
                
                {project.status === "verified" && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-success">
                      Credits Available: {project.credits.toLocaleString()} tCO2
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    disabled={project.status !== "verified"}
                  >
                    View Details
                  </Button>
                  {project.status === "verified" && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Generate Credits
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
