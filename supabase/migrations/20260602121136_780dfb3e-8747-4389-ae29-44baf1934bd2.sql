
CREATE POLICY "Project docs read" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
CREATE POLICY "Project docs insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');
CREATE POLICY "Project docs update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-documents');
CREATE POLICY "Project docs delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');
