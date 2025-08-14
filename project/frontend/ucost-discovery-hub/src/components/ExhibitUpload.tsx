import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Upload, Image, Video, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationMapSelector } from './LocationMapSelector';
import { describeFromImage, DescribeImageResponse } from '@/lib/ocr';

interface ExhibitData {
  name: string;
  category: string;
  location: string;
  description: string;
  ageRange: string;
  type: string;
  environment: string;
  features: string[];
  images: File[];
  mapLocation: any;
}

interface LocationData {
  floor: string;
  x: number;
  y: number;
}

export default function ExhibitUpload({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [exhibitData, setExhibitData] = useState<ExhibitData>({
    name: '', category: '', location: '', description: '', ageRange: '', type: '', environment: '',
    features: [], images: [], mapLocation: null,
  });
  const [currentFloor, setCurrentFloor] = useState<'outside' | 'ground' | 'first'>('ground');
  const { toast } = useToast();

  // OCR states
  const [ocrImage, setOcrImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<DescribeImageResponse | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleOCRImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrImage(file);
      setOcrError(null);
      setOcrResult(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!ocrImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setOcrError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await describeFromImage(ocrImage);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setOcrResult(result);
    } catch (error: any) {
      setOcrError(error.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const appendToDescription = (text: string) => {
    setExhibitData(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}\n\n${text}` : text
    }));
  };

  const replaceDescription = (text: string) => {
    setExhibitData(prev => ({
      ...prev,
      description: text
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    toast({
      title: "Exhibit Uploaded!",
      description: "Your exhibit has been successfully uploaded.",
    });
    onBack();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Exhibit Basics</h2>
            <p className="text-gray-300">Start by providing the core details of your exhibit.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Exhibit Name *</Label>
                <Input
                  id="name"
                  value={exhibitData.name}
                  onChange={(e) => setExhibitData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter exhibit name"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select value={exhibitData.category} onValueChange={(value) => setExhibitData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="astronomy">Astronomy</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location *</Label>
                <Input
                  id="location"
                  value={exhibitData.location}
                  onChange={(e) => setExhibitData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Exhibit Description</h2>
            <p className="text-gray-300">Provide a detailed description for your exhibit. You can also use AI to help generate it from an image.</p>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description *</Label>
              <Textarea
                id="description"
                value={exhibitData.description}
                onChange={(e) => setExhibitData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the exhibit, its purpose, and what visitors will learn"
                rows={8}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <Card className="p-4 border-dashed border-2 border-blue-300/50 bg-blue-50/20 dark:bg-blue-900/20 backdrop-blur-sm dark:border-blue-600/50">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-800 dark:text-blue-200">
                  <Sparkles className="h-5 w-5 text-blue-500" /> Analyze from Image with AI (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">Upload an image of an information board or exhibit text, and AI will extract and suggest a description.</p>
                <div className="flex items-center space-x-2">
                  <Input
                    id="ocr-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleOCRImageUpload}
                    ref={fileInputRef}
                    className="flex-grow"
                    disabled={isAnalyzing}
                  />
                  <Button onClick={handleAnalyzeImage} disabled={!ocrImage || isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {analysisProgress < 25 && 'Uploading...'}
                        {analysisProgress >= 25 && analysisProgress < 50 && 'Extracting Text...'}
                        {analysisProgress >= 50 && analysisProgress < 75 && 'Analyzing Content...'}
                        {analysisProgress >= 75 && 'Generating Description...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Extract with AI
                      </>
                    )}
                  </Button>
                </div>
                {isAnalyzing && (
                  <Progress value={analysisProgress} className="w-full mt-2" />
                )}
                {ocrError && (
                  <p className="text-red-500 text-sm mt-2">{ocrError}</p>
                )}
                {ocrResult && (
                  <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-md mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> AI-Generated Description Suggestion
                    </h3>
                    <div className="space-y-3">
                      {ocrResult.enhanced.englishFinal && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">English:</h4>
                          <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">{ocrResult.enhanced.englishFinal}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => appendToDescription(ocrResult.enhanced.englishFinal)}>Append English</Button>
                            <Button variant="outline" size="sm" onClick={() => replaceDescription(ocrResult.enhanced.englishFinal)}>Replace with English</Button>
                          </div>
                        </div>
                      )}
                      {ocrResult.enhanced.hindiFinal && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">हिन्दी:</h4>
                          <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">{ocrResult.enhanced.hindiFinal}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => appendToDescription(ocrResult.enhanced.hindiFinal)}>Append Hindi</Button>
                            <Button variant="outline" size="sm" onClick={() => replaceDescription(ocrResult.enhanced.hindiFinal)}>Replace with Hindi</Button>
                          </div>
                        </div>
                      )}
                      
                      {(ocrResult.enhanced.englishFinal || ocrResult.enhanced.hindiFinal) && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Combine Languages:</h4>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                let combinedText = '';
                                if (ocrResult.enhanced.englishFinal && ocrResult.enhanced.hindiFinal) {
                                  combinedText = `English:\n${ocrResult.enhanced.englishFinal}\n\nहिन्दी:\n${ocrResult.enhanced.hindiFinal}`;
                                } else if (ocrResult.enhanced.englishFinal) {
                                  combinedText = ocrResult.enhanced.englishFinal;
                                } else if (ocrResult.enhanced.hindiFinal) {
                                  combinedText = ocrResult.enhanced.hindiFinal;
                                }
                                if (combinedText) {
                                  replaceDescription(combinedText);
                                }
                              }}
                            >
                              Combine Both Languages
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ocrResult.enhanced.englishFinal && ocrResult.enhanced.hindiFinal 
                              ? "Combines English and Hindi descriptions together"
                              : "Uses the available language description"
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Target Audience</h2>
            <p className="text-gray-300">Define the target audience and exhibit characteristics.</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-white">Target Age Range *</Label>
                <RadioGroup value={exhibitData.ageRange} onValueChange={(value) => setExhibitData(prev => ({ ...prev, ageRange: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="kids" id="kids" />
                    <Label htmlFor="kids">Kids (5-12 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="students" id="students" />
                    <Label htmlFor="students">Students (13-18 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="families" id="families" />
                    <Label htmlFor="families">Families (All ages)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="researchers" id="researchers" />
                    <Label htmlFor="researchers">Researchers/Adults</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Exhibit Type *</Label>
                <RadioGroup value={exhibitData.type} onValueChange={(value) => setExhibitData(prev => ({ ...prev, type: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interactive" id="interactive" />
                    <Label htmlFor="interactive">Interactive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="passive" id="passive" />
                    <Label htmlFor="passive">Passive/Observational</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hands-on" id="hands-on" />
                    <Label htmlFor="hands-on">Hands-on Activity</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-white">Environment *</Label>
                <RadioGroup value={exhibitData.environment} onValueChange={(value) => setExhibitData(prev => ({ ...prev, environment: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="indoor" id="indoor" />
                    <Label htmlFor="indoor">Indoor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outdoor" id="outdoor" />
                    <Label htmlFor="outdoor">Outdoor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both Indoor & Outdoor</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Map Location</h2>
            <LocationMapSelector
              selectedLocation={exhibitData.mapLocation}
              onLocationSelect={(location: LocationData) => setExhibitData(prev => ({ ...prev, mapLocation: location }))}
              selectedFloor={currentFloor}
              onFloorChange={setCurrentFloor}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Exhibit Features & Media</h2>
            <p className="text-gray-300">Select features and upload media for your exhibit.</p>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Exhibit Features</h3>
                <p className="text-sm text-gray-300">Select the features available at this exhibit.</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Audio Guide', 'Video Content', 'Interactive Touch', '3D Models', 'Live Demonstrations', 'Guided Tours'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={exhibitData.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExhibitData(prev => ({ ...prev, features: [...prev.features, feature] }));
                          } else {
                            setExhibitData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
                          }
                        }}
                      />
                      <Label htmlFor={feature} className="text-white">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Media Uploads</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Exhibit Images</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload images</p>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setExhibitData(prev => ({ ...prev, images: [...prev.images, ...files] }));
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Video URL (Optional)</Label>
                    <Input
                      placeholder="Enter video URL"
                      type="url"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Review & Submit</h2>
            <p className="text-gray-300">Review your exhibit details before submitting.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold text-white">Name</Label>
                  <p className="text-gray-300">{exhibitData.name}</p>
                </div>
                <div>
                  <Label className="font-semibold text-white">Category</Label>
                  <p className="text-gray-300">{exhibitData.category}</p>
                </div>
                <div>
                  <Label className="font-semibold text-white">Location</Label>
                  <p className="text-gray-300">{exhibitData.location}</p>
                </div>
                <div>
                  <Label className="font-semibold text-white">Age Range</Label>
                  <p className="text-gray-300">{exhibitData.ageRange}</p>
                </div>
                <div>
                  <Label className="font-semibold text-white">Type</Label>
                  <p className="text-gray-300">{exhibitData.type}</p>
                </div>
                <div>
                  <Label className="font-semibold text-white">Environment</Label>
                  <p className="text-gray-300">{exhibitData.environment}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold text-white">Description</Label>
                <p className="whitespace-pre-wrap text-gray-300">{exhibitData.description}</p>
              </div>

              <div>
                <Label className="font-semibold text-white">Features</Label>
                <p className="text-gray-300">{exhibitData.features.join(', ')}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 p-4">
      <Card className="w-full max-w-4xl mx-auto my-8 bg-gray-900/90 backdrop-blur-md shadow-2xl border border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Panel
            </Button>
          </div>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Upload New Exhibit</span>
            <span className="text-sm text-gray-300">Step {currentStep} of {totalSteps}</span>
          </CardTitle>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-6">
            <Button onClick={prevStep} disabled={currentStep === 1} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <CheckCircle className="mr-2 h-4 w-4" /> Submit Exhibit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 