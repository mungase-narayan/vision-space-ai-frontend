import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, DollarSign, Trash2 } from "lucide-react";

import useDeleteModel from "../hooks/use-delete-model";
import { ConfirmDeleteButton } from "@/components";
import AddModel from "../view-model/components/add-model";
import useUpdateModel from "../hooks/use-update-model";
import Update from "../view-model/components/update";

export default function CategoryTable({ data, refetch }) {
  const { isPending, mutate } = useDeleteModel({
    fn: () => {
      refetch();
    },
  });
  const { isPending: isUpdating, mutate: updateModel } = useUpdateModel({
    fn: () => {
      refetch();
      setOpen(false);
    },
  });

  const [open, setOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatPrice = (price) => {
    const num = Number.parseFloat(price);
    if (num === 0) return "Free";
    return `$${(num * 1000000).toFixed(2)}/1M`;
  };

  return (
    <div className="w-full mt-3">
      <Card className="overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Models Count</TableHead>
                <TableHead className="text-center">Default Model</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <Fragment key={category._id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => toggleCategory(category._id)}>
                      {expandedCategories.has(category._id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.models.length}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{category.defaultModel}</Badge>
                    </TableCell>
                    <TableCell className="text-center flex items-center gap-2 justify-center">
                      <AddModel
                        open={open}
                        setOpen={setOpen}
                        isLoading={isUpdating}
                        models={category.models}
                        onSave={(models) => {
                          updateModel({
                            data: { aiModelId: category._id, models },
                          });
                        }}
                      />

                      <Update
                        modelName={category.name}
                        aiModelId={category._id}
                        refetch={refetch}
                        model={category.defaultModel}
                        selectedModels={category.models}
                      />

                      <ConfirmDeleteButton
                        itemName="Category"
                        onDelete={() => {
                          mutate({
                            data: { aiModelId: category._id },
                          });
                        }}
                        isLoading={isPending}
                      />
                    </TableCell>
                  </TableRow>

                  {expandedCategories.has(category._id) && (
                    <TableRow key={`${category._id}-expanded`}>
                      <TableCell colSpan={5} className="p-0 bg-muted/20">
                        <div className="p-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="h-10">
                                  Model Name
                                </TableHead>
                                <TableHead className="h-10">Value</TableHead>
                                <TableHead className="h-10">
                                  Input Types
                                </TableHead>
                                <TableHead className="h-10">Pricing</TableHead>
                                <TableHead className="h-10">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {category.models.map((model, index) => (
                                <TableRow
                                  key={`${category._id}-model-${index}`}
                                  className="border-muted"
                                >
                                  <TableCell className="font-medium">
                                    {model.label}
                                  </TableCell>
                                  <TableCell>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {model.value}
                                    </code>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {model.inputModalities.map((modality) => (
                                        <Badge
                                          key={modality}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {modality}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>
                                          Prompt:{" "}
                                          {formatPrice(model.pricing.prompt)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>
                                          Completion:{" "}
                                          {formatPrice(
                                            model.pricing.completion
                                          )}
                                        </span>
                                      </div>
                                      {model.pricing.image &&
                                        Number.parseFloat(model.pricing.image) >
                                          0 && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            <span>
                                              Image:{" "}
                                              {(
                                                model.pricing.image * 1000
                                              ).toFixed(3)}
                                              /1K
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <ConfirmDeleteButton
                                      isLoading={isUpdating}
                                      itemName="Model"
                                      onDelete={() => {
                                        const models = category.models.filter(
                                          (p) => p.value !== model.value
                                        );
                                        updateModel({
                                          data: {
                                            aiModelId: category._id,
                                            models,
                                          },
                                        });
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
