import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Zap, 
  Edit, 
  Trash2, 
  Play, 
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Hash,
  Send,
  Tag as TagIcon,
  User,
  ArrowRight,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  stats: {
    triggered: number;
    lastTriggered?: string;
  };
}

interface RuleCondition {
  id: string;
  type: "keyword" | "platform" | "time" | "sentiment" | "contact_tag";
  operator: "contains" | "equals" | "not_equals" | "matches" | "greater_than" | "less_than";
  value: string;
}

interface RuleAction {
  id: string;
  type: "reply" | "tag" | "assign" | "forward" | "webhook" | "delay";
  value: string;
  metadata?: Record<string, any>;
}

const mockRules: Rule[] = [
  {
    id: "1",
    name: "After Hours Auto-Reply",
    description: "Automatically respond to messages received outside business hours",
    enabled: true,
    priority: 1,
    conditions: [
      { id: "c1", type: "time", operator: "greater_than", value: "18:00" },
      { id: "c2", type: "time", operator: "less_than", value: "09:00" }
    ],
    actions: [
      { 
        id: "a1", 
        type: "reply", 
        value: "Thanks for reaching out! We're currently away but will respond during business hours (9 AM - 6 PM)." 
      }
    ],
    stats: { triggered: 127, lastTriggered: "2024-01-15 19:23" }
  },
  {
    id: "2",
    name: "Support Keyword Router",
    description: "Route support inquiries to the support team",
    enabled: true,
    priority: 2,
    conditions: [
      { id: "c3", type: "keyword", operator: "contains", value: "help|support|issue|problem" }
    ],
    actions: [
      { id: "a2", type: "tag", value: "support" },
      { id: "a3", type: "assign", value: "support-team" },
      { id: "a4", type: "reply", value: "We've received your support request. Our team will assist you shortly." }
    ],
    stats: { triggered: 342, lastTriggered: "2024-01-15 14:55" }
  },
  {
    id: "3",
    name: "Pricing Inquiry Auto-Response",
    description: "Provide pricing information automatically",
    enabled: true,
    priority: 3,
    conditions: [
      { id: "c4", type: "keyword", operator: "contains", value: "price|cost|pricing|quote" }
    ],
    actions: [
      { 
        id: "a5", 
        type: "reply", 
        value: "Thanks for your interest! You can find our pricing at https://example.com/pricing or reply 'QUOTE' for a custom quote." 
      },
      { id: "a6", type: "tag", value: "pricing-inquiry" }
    ],
    stats: { triggered: 89, lastTriggered: "2024-01-15 16:12" }
  },
  {
    id: "4",
    name: "VIP Customer Fast Track",
    description: "Priority handling for VIP customers",
    enabled: false,
    priority: 0,
    conditions: [
      { id: "c5", type: "contact_tag", operator: "equals", value: "vip" }
    ],
    actions: [
      { id: "a7", type: "assign", value: "vip-team" },
      { id: "a8", type: "tag", value: "priority" }
    ],
    stats: { triggered: 23, lastTriggered: "2024-01-14 11:30" }
  }
];

const conditionTypes = [
  { value: "keyword", label: "Message Contains Keyword", icon: Hash },
  { value: "platform", label: "Platform Type", icon: MessageSquare },
  { value: "time", label: "Time of Day", icon: Clock },
  { value: "sentiment", label: "Message Sentiment", icon: AlertCircle },
  { value: "contact_tag", label: "Contact Has Tag", icon: TagIcon }
];

const actionTypes = [
  { value: "reply", label: "Send Auto-Reply", icon: MessageSquare },
  { value: "tag", label: "Add Tag", icon: TagIcon },
  { value: "assign", label: "Assign to Team", icon: User },
  { value: "forward", label: "Forward Message", icon: Send },
  { value: "webhook", label: "Trigger Webhook", icon: Zap },
  { value: "delay", label: "Add Delay", icon: Clock }
];

export default function Automation() {
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();
  const currentPath = "/automation";

  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: "",
    description: "",
    enabled: true,
    priority: 5,
    conditions: [],
    actions: []
  });

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast({
      title: "Rule Updated",
      description: "Rule status has been changed.",
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: "The automation rule has been removed.",
      variant: "destructive"
    });
  };

  const handleDuplicateRule = (rule: Rule) => {
    const duplicated = {
      ...rule,
      id: `${Date.now()}`,
      name: `${rule.name} (Copy)`,
      stats: { triggered: 0 }
    };
    setRules(prev => [...prev, duplicated]);
    toast({
      title: "Rule Duplicated",
      description: "A copy of the rule has been created.",
    });
  };

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { id: `c${Date.now()}`, type: "keyword", operator: "contains", value: "" }
      ]
    }));
  };

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        { id: `a${Date.now()}`, type: "reply", value: "" }
      ]
    }));
  };

  const updateCondition = (id: string, field: string, value: any) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const updateAction = (id: string, field: string, value: any) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const removeCondition = (id: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(c => c.id !== id)
    }));
  };

  const removeAction = (id: string) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.filter(a => a.id !== id)
    }));
  };

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.conditions?.length || !newRule.actions?.length) {
      toast({
        title: "Validation Error",
        description: "Please provide a name, at least one condition, and one action.",
        variant: "destructive"
      });
      return;
    }

    const rule: Rule = {
      id: `${Date.now()}`,
      name: newRule.name,
      description: newRule.description || "",
      enabled: newRule.enabled ?? true,
      priority: newRule.priority ?? 5,
      conditions: newRule.conditions || [],
      actions: newRule.actions || [],
      stats: { triggered: 0 }
    };

    setRules(prev => [...prev, rule]);
    setIsCreateDialogOpen(false);
    setNewRule({
      name: "",
      description: "",
      enabled: true,
      priority: 5,
      conditions: [],
      actions: []
    });

    toast({
      title: "Rule Created",
      description: "Your automation rule is now active.",
    });
  };

  const handleTestRule = () => {
    if (!testMessage || !selectedRule) return;

    // Simple mock test logic
    const matchedConditions = selectedRule.conditions.filter(cond => {
      if (cond.type === "keyword") {
        const keywords = cond.value.split("|");
        return keywords.some(kw => testMessage.toLowerCase().includes(kw.toLowerCase()));
      }
      return false;
    });

    const result = {
      matched: matchedConditions.length > 0,
      matchedConditions: matchedConditions.length,
      totalConditions: selectedRule.conditions.length,
      triggeredActions: matchedConditions.length > 0 ? selectedRule.actions : []
    };

    setTestResult(result);
  };

  const getConditionIcon = (type: string) => {
    const found = conditionTypes.find(ct => ct.value === type);
    return found ? found.icon : Hash;
  };

  const getActionIcon = (type: string) => {
    const found = actionTypes.find(at => at.value === type);
    return found ? found.icon : Send;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar currentPath={currentPath} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Automation Rules
              </h1>
              <p className="text-muted-foreground">
                Create intelligent workflows to automate responses and actions
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Rule
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Rules</p>
                  <p className="text-3xl font-bold">{rules.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Rules</p>
                  <p className="text-3xl font-bold">{rules.filter(r => r.enabled).length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Triggers</p>
                  <p className="text-3xl font-bold">
                    {rules.reduce((sum, r) => sum + r.stats.triggered, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Play className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg. Response Time</p>
                  <p className="text-3xl font-bold">1.2s</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map(rule => {
              const ConditionIcon = getConditionIcon(rule.conditions[0]?.type);
              const ActionIcon = getActionIcon(rule.actions[0]?.type);
              
              return (
                <Card key={rule.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{rule.name}</h3>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Active" : "Disabled"}
                        </Badge>
                        <Badge variant="outline">
                          Priority: {rule.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {rule.description}
                      </p>
                      
                      {/* Rule Logic Preview */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                          <ConditionIcon className="w-4 h-4 text-primary" />
                          <span>{rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10">
                          <ActionIcon className="w-4 h-4 text-accent" />
                          <span>{rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRule(rule);
                          setIsTestDialogOpen(true);
                          setTestResult(null);
                        }}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateRule(rule)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Triggered {rule.stats.triggered} times</span>
                    </div>
                    {rule.stats.lastTriggered && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Last: {rule.stats.lastTriggered}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Create Rule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., After Hours Auto-Reply"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="rule-desc">Description</Label>
                  <Textarea
                    id="rule-desc"
                    placeholder="Describe what this rule does..."
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="priority">Priority (0-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      max="10"
                      value={newRule.priority}
                      onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newRule.enabled}
                      onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, enabled: checked }))}
                    />
                    <Label>Enable immediately</Label>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Conditions (IF) *</Label>
                  <Button onClick={addCondition} variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </Button>
                </div>

                {newRule.conditions?.map((condition, index) => (
                  <Card key={condition.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <Select
                          value={condition.type}
                          onValueChange={(value) => updateCondition(condition.id, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionTypes.map(ct => (
                              <SelectItem key={ct.value} value={ct.value}>
                                {ct.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(condition.id, "operator", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="matches">Matches (Regex)</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Value..."
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {index < (newRule.conditions?.length || 0) - 1 && (
                      <div className="text-center text-sm text-muted-foreground mt-2">AND</div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Actions (THEN) *</Label>
                  <Button onClick={addAction} variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Action
                  </Button>
                </div>

                {newRule.actions?.map((action, index) => (
                  <Card key={action.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <Select
                          value={action.type}
                          onValueChange={(value) => updateAction(action.id, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map(at => (
                              <SelectItem key={at.value} value={at.value}>
                                {at.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {action.type === "reply" && (
                          <Textarea
                            placeholder="Auto-reply message..."
                            value={action.value}
                            onChange={(e) => updateAction(action.id, "value", e.target.value)}
                          />
                        )}

                        {(action.type === "tag" || action.type === "assign") && (
                          <Input
                            placeholder={action.type === "tag" ? "Tag name..." : "Team or user..."}
                            value={action.value}
                            onChange={(e) => updateAction(action.id, "value", e.target.value)}
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(action.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Rule Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Rule: {selectedRule?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="test-message">Test Message</Label>
              <Textarea
                id="test-message"
                placeholder="Enter a sample message to test against this rule..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleTestRule} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Run Test
            </Button>

            {testResult && (
              <Card className={`p-6 ${testResult.matched ? 'border-green-500' : 'border-orange-500'}`}>
                <div className="flex items-start gap-3 mb-4">
                  {testResult.matched ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  )}
                  <div>
                    <h4 className="font-semibold mb-1">
                      {testResult.matched ? "Rule Matched!" : "Rule Did Not Match"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testResult.matchedConditions} of {testResult.totalConditions} conditions matched
                    </p>
                  </div>
                </div>

                {testResult.matched && testResult.triggeredActions.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Actions that would be triggered:</p>
                    <div className="space-y-2">
                      {testResult.triggeredActions.map((action: RuleAction) => {
                        const ActionIconComp = getActionIcon(action.type);
                        return (
                          <div key={action.id} className="flex items-center gap-2 text-sm">
                            <ActionIconComp className="w-4 h-4 text-accent" />
                            <span className="font-medium capitalize">{action.type}:</span>
                            <span className="text-muted-foreground">{action.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}