import { getSupabaseClient } from "../../utility/supabase.ts";
import { PostgrestError } from "@supabase/supabase-js";

type URL = string;

export type ProjectSearchCriteria = {
    owner: string;
    name?: string | null;
    repo?: URL | null;
    id: string | null;
};

export type Project = {
    id: string;
    name: string;
    repo: URL;
    owner: string;
    created_at: string;
};

const sb = getSupabaseClient();

/*
=== Projects handler ===
*/

// Get all projects from a user
async function get(searchCriteria: ProjectSearchCriteria): Promise<Project[] | PostgrestError> {
    // Get all projects by a specific user
    let query = sb.from('projects').select<`*`, Project>('*');

    if (searchCriteria.owner) {
        query = query.eq('owner', searchCriteria.owner);
    }
    if (searchCriteria.name) {
        query = query.eq('name', searchCriteria.name);
    }
    if (searchCriteria.repo) {
        query = query.eq('repo', searchCriteria.repo);
    }
    if (searchCriteria.id) {
        query = query.eq('id', searchCriteria.id);
    }

    const { data, error } = await query;

    if (error) {
        return error;
    }

    // Returns data
    return data || [];
}

// Create a new project
async function create(userUUID: string, projectName: string, projectRepo: URL): Promise<Project[] | PostgrestError> {
    // Create the project in the `projects` table
    const { data, error } = await sb
        .from('projects')
        .insert({
            name: projectName,
            repo: projectRepo,
            owner: userUUID
        })
        .select<`*`, Project>('*');

    if (error) {
        return error;
    }

    // Returns data
    return data || [];
}

// Edit a project
async function edit(projectUUID: string, projectName: string, projectRepo: URL): Promise<Project[] | PostgrestError> {
    // Edit the project in the `projects` table
    const { data, error } = await sb
        .from('projects')
        .update({
            name: projectName,
            repo: projectRepo
        })
        .eq('id', projectUUID)
        .select<`*`, Project>('*');

    if (error) {
        return error;
    }

    // Returns data
    return data || [];
}

// Delete a project
async function deleteP(projectUUID: string): Promise<Project[] | PostgrestError> {
    // Delete the project from the `projects` table
    const { data, error } = await sb
        .from('projects')
        .delete()
        .eq('id', projectUUID)
        .select<`*`, Project>('*');

    if (error) {
        return error;
    }

    // Returns data
    return data || [];
}

export default { get, create, edit, delete: deleteP };