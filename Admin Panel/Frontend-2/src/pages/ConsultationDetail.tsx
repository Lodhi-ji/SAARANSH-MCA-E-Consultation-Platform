import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Download, Eye, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { wordCloudData, STANCE_COLORS, STANCE_BG_COLORS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ViewFullTextModal from '@/components/ViewFullTextModal';
import SentimentDistributionCard from '@/components/SentimentDistributionCard';
import SectionSummaryCard from '@/components/SectionSummaryCard';

const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [wordCloudFilter, setWordCloudFilter] = useState('All');
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const consultationId = parseInt(id || '1');
  const [consultation, setConsultation] = React.useState<any | null>(null);
  const [comments, setComments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const wordCloud = wordCloudData[consultationId] || {};

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch consultations to get bill key and metadata
        const cRes = await fetch(`${import.meta.env.VITE_API_URL}/api/consultations`);
        const cJson = await cRes.json();
        let meta = null;
        if (cJson.ok) {
          meta = (cJson.data || []).find((c: any) => Number(c.id) === consultationId);
        }

        if (meta) {
          setConsultation(meta);
          // fetch comments for the bill key (e.g., bill_1)
          const billKey = meta.bill || `bill_${meta.id}`;
          const commentsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${billKey}`);
          const commentsJson = await commentsRes.json();
          const rows = commentsJson.ok ? commentsJson.data : [];

          // Map DB rows to frontend comment model
          let mapped = (rows || []).map((r: any) => ({
            id: r.comments_id || r.id || r.comment_id || r.commentsid || Math.random(),
            submitter: r.commenter_name || r.submitter || 'Anonymous',
            stakeholderType: r.stakeholder_type || r.stakeholderType || 'Individual',
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : (r.date || ''),
            stance: r.sentiment || r.stance || 'Neutral',
            summary: r.comment_data || r.summary || (r.comment_data ? String(r.comment_data).slice(0, 200) : ''),
            confidenceScore_based_on_ensemble_model: r.confidence_score || r.confidenceScore_based_on_ensemble_model || 0,
            originalText: r.comment_data || r.originalText || '',
            keywords: r.keywords || [],
            mlModel: r.ml_model || r.model || null,
            consultationId: consultationId
          }));

          // If no comments returned, use dummy data for testing
          if (mapped.length === 0) {
            console.warn('No comments found in database, using dummy data for testing');
            mapped = [
              {
                id: 1,
                submitter: 'John Doe',
                stakeholderType: 'Individual',
                date: '2025-12-01',
                stance: 'Positive',
                summary: 'This is a great proposal that will benefit our organization.',
                confidenceScore_based_on_ensemble_model: 4.5,
                originalText: 'This is a great proposal that will benefit our organization significantly.',
                keywords: ['benefit', 'organization'],
                mlModel: 'ensemble_v1',
                consultationId: consultationId
              },
              {
                id: 2,
                submitter: 'Jane Smith',
                stakeholderType: 'Law Firm',
                date: '2025-12-02',
                stance: 'Negative',
                summary: 'There are some concerns about the implementation details.',
                confidenceScore_based_on_ensemble_model: 3.2,
                originalText: 'There are some concerns about the implementation details that need to be addressed.',
                keywords: ['concerns', 'implementation'],
                mlModel: 'ensemble_v1',
                consultationId: consultationId
              },
              {
                id: 3,
                submitter: 'NGO Representative',
                stakeholderType: 'NGO',
                date: '2025-12-03',
                stance: 'Neutral',
                summary: 'The proposal has merits but requires further consultation.',
                confidenceScore_based_on_ensemble_model: 3.8,
                originalText: 'The proposal has merits but requires further consultation with stakeholders.',
                keywords: ['consultation', 'stakeholders'],
                mlModel: 'ensemble_v1',
                consultationId: consultationId
              }
            ];
          }

          setComments(mapped);
        } else {
          // fallback: set a minimal consultation if none returned
          const dummyConsultation = {
            id: consultationId,
            title: 'Consultation ' + consultationId,
            status: 'In Progress',
            submissions: 0,
            endDate: '2025-12-31',
            description: 'This is a test consultation'
          };
          setConsultation(dummyConsultation);
          setComments([]);
        }
      } catch (e) {
        console.error('Error loading consultation data', e);
        const dummyConsultation = {
          id: consultationId,
          title: 'Consultation ' + consultationId,
          status: 'Draft',
          submissions: 0,
          endDate: '2025-12-31',
          description: 'This is a test consultation'
        };
        setConsultation(dummyConsultation);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [consultationId]);

  const filteredComments = useMemo(() => {
    return comments
      .filter(c => filter === 'All' || c.stance === filter)
      .filter(c => {
        const submitter = (c.submitter || '').toString().toLowerCase();
        const summary = (c.summary || '').toString().toLowerCase();
        const keywords = Array.isArray(c.keywords) ? c.keywords : [];
        return (
          submitter.includes(searchTerm.toLowerCase()) ||
          summary.includes(searchTerm.toLowerCase()) ||
          keywords.some((keyword: string) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
  }, [comments, filter, searchTerm]);



  const filteredWordCloud = (wordCloud[wordCloudFilter] as any[] || []) as any[];

  const avgConfidence = comments.length ? (comments.reduce((sum, c) => sum + ((c.confidenceScore_based_on_ensemble_model as number) || 0), 0) / comments.length) : 0;

  if (!consultation && loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">Consultation not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {consultation.title}
          </h1>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>{consultation.submissions} submissions</span>
            <span>•</span>
            <span>Due: {consultation.endDate}</span>
            <span>•</span>
            <Badge variant={
              consultation.status === 'Analysis Complete' ? 'default' :
                consultation.status === 'In Progress' ? 'secondary' :
                  'outline'
            }>
              {consultation.status}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            {consultation.description}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="wordcloud">WordCloud</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Chart */}
            <SentimentDistributionCard comments={comments} avgConfidence={avgConfidence} />

            {/* Key Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
                <CardDescription>
                  Analysis metrics for this consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card-hover rounded-lg">
                    <div className="text-2xl font-bold text-primary">{comments.length}</div>
                    <div className="text-sm text-muted-foreground">Total Comments</div>
                  </div>
                  <div className="text-center p-4 bg-card-hover rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {comments.filter(c => c.stance === 'Positive').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Positive</div>
                  </div>
                  <div className="text-center p-4 bg-card-hover rounded-lg">
                    <div className="text-2xl font-bold text-destructive">
                      {comments.filter(c => c.stance === 'Negative').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Negative</div>
                  </div>
                  <div className="text-center p-4 bg-card-hover rounded-lg">
                    <div className="text-2xl font-bold text-warning">
                      {comments.filter(c => c.stance === 'Neutral').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Neutral</div>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="text-sm text-muted-foreground mb-2">Average Confidence Score</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${avgConfidence * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {avgConfidence.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-80"
                />
              </div>
              <div className="flex items-center bg-secondary rounded-lg p-1">
                {['All', 'Positive', 'Negative', 'Neutral'].map(stance => (
                  <Button
                    key={stance}
                    variant={filter === stance ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(stance)}
                    className="text-xs"
                  >
                    {stance}
                  </Button>
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredComments.length} of {comments.length} submissions
            </span>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{comment.submitter}</h3>
                      <p className="text-sm text-muted-foreground">{comment.stakeholderType} • {comment.date} {comment.mlModel ? '• Model: ' + comment.mlModel : ''}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs border", STANCE_BG_COLORS[comment.stance as keyof typeof STANCE_BG_COLORS])}>
                        {comment.stance}
                      </Badge>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Score:</span>
                        <span className="text-sm font-medium">{comment.confidenceScore_based_on_ensemble_model}/5</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground mb-4">{comment.summary}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {comment.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedComment({
                          ...comment,
                          fullText: comment.originalText
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Full Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wordcloud" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Word Cloud Analysis</CardTitle>
                  <CardDescription>
                    Visual representation of key ts and topics via WordCloud
                  </CardDescription>
                </div>
                <div className="flex items-center bg-secondary rounded-lg p-1">
                  {['All', 'Positive', 'Negative', 'Neutral'].map(stance => (
                    <Button
                      key={stance}
                      variant={wordCloudFilter === stance ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setWordCloudFilter(stance)}
                      className="text-xs"
                    >
                      {stance}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] flex items-center justify-center p-8">
                {filteredWordCloud.length > 0 ? (
                  <div className="w-full flex justify-center">
                    <img
                      src={filteredWordCloud[0].image}
                      alt={filteredWordCloud[0].alt}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">No word cloud available for this filter.</p>
                    <p className="text-sm mt-2">Try selecting a different stance or "All".</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Analysis</CardTitle>
                <CardDescription>
                  Breakdown by stakeholder type and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    comments.reduce((acc, comment) => {
                      acc[comment.stakeholderType] = (acc[comment.stakeholderType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]: [string, number]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${((count as number) / comments.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <SectionSummaryCard document={consultation.document} />
          </div>
        </TabsContent>
      </Tabs>

      <ViewFullTextModal
        comment={selectedComment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComment(null);
        }}
      />
    </div>
  );
};

export default ConsultationDetail;