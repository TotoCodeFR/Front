import { UUID } from "node:crypto";
import { getSupabaseClient } from "../../utility/supabase.ts";

type URL = string;

export type ProjectSearchCriteria = {
    owner: UUID;
    name: string | null;
    repo: URL | null;
    id: UUID | null;
};

export type Project = {
    id: UUID;
    name: string;
    repo: URL;
    owner: UUID;
    created_at: Date;
};

const sb = getSupabaseClient();

/*
=== Projects handler ===
*/

// Get all projects from a user
async function get(searchCriteria: ProjectSearchCriteria) {
    // Get all projects by a specific user
    let query = sb.from('projects').select('*');

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
    return data;
}

// Create a new project
async function create(userUUID: UUID, projectName: string, projectRepo: URL) {
    // Create the project in the `projects` table
    const { data, error } = await sb
        .from('projects')
        .insert({
            name: projectName,
            repo: projectRepo,
            owner: userUUID
        })
        .select();

    if (error) {
        return error;
    }

    // Returns data
    return data;
}

// Edit a project
async function edit(projectUUID: UUID, projectName: string, projectRepo: URL) {
    // Edit the project in the `projects` table
    const { data, error } = await sb
        .from('projects')
        .update({
            name: projectName,
            repo: projectRepo
        })
        .eq('id', projectUUID)
        .select();

    if (error) {
        return error;
    }

    // Returns data
    return data;
}

// Delete a project
async function deleteP(projectUUID: UUID) {
    // Delete the project from the `projects` table
    const { data, error } = await sb
        .from('projects')
        .delete()
        .eq('id', projectUUID)
        .select();

    if (error) {
        return error;
    }

    // Returns data
    return data;
}

export default { get, create, edit, delete: deleteP };